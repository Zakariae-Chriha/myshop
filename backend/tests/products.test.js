require('./setup');
const request = require('supertest');
const app     = require('../app');

// ─── Helpers ────────────────────────────────────────────────────────────────

const createAdmin = async () => {
  const User = require('../models/User');
  await User.create({
    name: 'Admin', email: 'admin@example.com',
    password: 'admin123', role: 'admin',
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  return res.body.token;
};

const createCustomer = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Customer', email: 'customer@example.com', password: 'pass123' });
  return res.body.token;
};

const createCategory = async (adminToken) => {
  const res = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: { en: 'Software', de: 'Software', ar: 'برمجيات' }, slug: 'software' });
  return res.body.category._id;
};

const buildProduct = (categoryId) => ({
  name:        { en: 'Test Product', de: 'Testprodukt', ar: 'منتج تجريبي' },
  description: { en: 'A test product', de: 'Ein Testprodukt', ar: 'منتج للاختبار' },
  price:       9.99,
  productType: 'digital',
  category:    categoryId,
  stock:       0,
});

// ─── List Products ───────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('returns empty list when no products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  it('returns list of products', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name.en).toBe('Test Product');
  });

  it('filters by search query', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));

    const res = await request(app).get('/api/products?search=Test');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });
});

// ─── Get Single Product ──────────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  it('returns product by id', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    const created    = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));

    const id  = created.body.product._id;
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.product._id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/products/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});

// ─── Create Product ──────────────────────────────────────────────────────────

describe('POST /api/products', () => {
  it('admin can create a product', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));
    expect(res.status).toBe(201);
    expect(res.body.product.price).toBe(9.99);
    expect(res.body.product.priceWithVAT).toBe(11.89);
  });

  it('customer cannot create a product', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const categoryId    = await createCategory(adminToken);
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(buildProduct(categoryId));
    expect(res.status).toBe(403);
  });

  it('rejects request without auth', async () => {
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(401);
  });

  it('rejects product without category', async () => {
    const token = await createAdmin();
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: { en: 'No Cat' }, price: 5, productType: 'digital' });
    expect(res.status).toBe(500);
  });
});

// ─── Update Product ──────────────────────────────────────────────────────────

describe('PUT /api/products/:id', () => {
  it('admin can update price', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    const created    = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));

    const id  = created.body.product._id;
    const res = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 19.99 });
    expect(res.status).toBe(200);
    expect(res.body.product.price).toBe(19.99);
  });
});

// ─── Delete Product ──────────────────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  it('admin can deactivate a product', async () => {
    const token      = await createAdmin();
    const categoryId = await createCategory(token);
    const created    = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(buildProduct(categoryId));

    const id  = created.body.product._id;
    const del = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    // Product is soft-deleted (isActive: false) — GET returns 404
    const check = await request(app).get(`/api/products/${id}`);
    expect(check.status).toBe(404);
  });

  it('customer cannot delete a product', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const categoryId    = await createCategory(adminToken);
    const created       = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(buildProduct(categoryId));

    const id  = created.body.product._id;
    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});
