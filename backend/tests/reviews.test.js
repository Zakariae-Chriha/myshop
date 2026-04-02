require('./setup');
const request = require('supertest');
const app     = require('../app');
const mongoose = require('mongoose');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const registerAndLogin = async (email = 'reviewer@example.com') => {
  await request(app).post('/api/auth/register').send({ name: 'Reviewer', email, password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return res.body.token;
};

const registerAdmin = async () => {
  const User = require('../models/User');
  await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@example.com', password: 'password123' });
  await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  return res.body.token;
};

const createCategory = async (adminToken) => {
  const slug = `test-cat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const res = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: { en: 'Test Category' }, slug, icon: '📦' });
  if (!res.body.category) throw new Error('Category creation failed: ' + JSON.stringify(res.body));
  return res.body.category._id;
};

const createProduct = async (adminToken, categoryId) => {
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: { en: 'Test Product' }, price: 10, productType: 'digital', category: categoryId });
  return res.body.product._id;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Reviews', () => {
  let userToken, adminToken, productId;

  beforeEach(async () => {
    userToken  = await registerAndLogin();
    adminToken = await registerAdmin();
    const catId = await createCategory(adminToken);
    productId   = await createProduct(adminToken, catId);
  });

  it('allows a logged-in user to submit a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 5, comment: 'Great product!' });
    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(5);
    expect(res.body.message).toMatch(/pending/i);
  });

  it('rejects review without auth', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ product: productId, rating: 4 });
    expect(res.status).toBe(401);
  });

  it('prevents duplicate review from same user', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 5 });
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 3 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it('returns only approved reviews publicly', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 5, comment: 'Nice!' });

    const res = await request(app).get(`/api/reviews/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(0); // not approved yet
  });

  it('admin can approve a review', async () => {
    const submitRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 4, comment: 'Good!' });

    const reviewId = submitRes.body.review._id;

    const approveRes = await request(app)
      .put(`/api/reviews/admin/${reviewId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.review.isApproved).toBe(true);

    // Now it appears publicly
    const publicRes = await request(app).get(`/api/reviews/${productId}`);
    expect(publicRes.body.reviews).toHaveLength(1);
  });

  it('approved review updates product average rating', async () => {
    const submitRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 4 });
    const reviewId = submitRes.body.review._id;

    await request(app)
      .put(`/api/reviews/admin/${reviewId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    const productRes = await request(app).get(`/api/products/${productId}`);
    expect(productRes.body.product.averageRating).toBe(4);
    expect(productRes.body.product.numReviews).toBe(1);
  });

  it('admin can delete a review', async () => {
    const submitRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 3 });
    const reviewId = submitRes.body.review._id;

    const deleteRes = await request(app)
      .delete(`/api/reviews/admin/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('admin can list pending reviews', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ product: productId, rating: 5 });

    const res = await request(app)
      .get('/api/reviews/admin/pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews.length).toBeGreaterThan(0);
  });
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

describe('Wishlist', () => {
  let userToken, adminToken, productId;

  beforeEach(async () => {
    userToken  = await registerAndLogin('wish@example.com');
    adminToken = await registerAdmin();
    const catId = await createCategory(adminToken);
    productId   = await createProduct(adminToken, catId);
  });

  it('starts empty', async () => {
    const res = await request(app)
      .get('/api/auth/wishlist')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.wishlist).toHaveLength(0);
  });

  it('adds a product to wishlist', async () => {
    const res = await request(app)
      .put(`/api/auth/wishlist/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.added).toBe(true);
    expect(res.body.wishlist).toHaveLength(1);
  });

  it('removes product when toggled again', async () => {
    await request(app).put(`/api/auth/wishlist/${productId}`).set('Authorization', `Bearer ${userToken}`);
    const res = await request(app).put(`/api/auth/wishlist/${productId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.body.added).toBe(false);
    expect(res.body.wishlist).toHaveLength(0);
  });

  it('rejects unauthenticated wishlist access', async () => {
    const res = await request(app).get('/api/auth/wishlist');
    expect(res.status).toBe(401);
  });
});
