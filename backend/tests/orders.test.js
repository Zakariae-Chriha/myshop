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

const createProduct = async (adminToken) => {
  const catRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: { en: 'Software', de: 'Software', ar: 'برمجيات' }, slug: 'software' });
  const categoryId = catRes.body.category._id;

  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name:        { en: 'Digital Item', de: 'Digitales Produkt', ar: 'عنصر رقمي' },
      description: { en: 'A digital product', de: 'Ein digitales Produkt', ar: 'منتج رقمي' },
      price:       9.99,
      productType: 'digital',
      category:    categoryId,
      stock:       0,
    });
  return res.body.product._id;
};

const shippingAddress = {
  fullName: 'Test User', street: 'Main St 1',
  city: 'Berlin', zip: '10115', country: 'Germany', phone: '+49123456789',
};

// ─── Create Order ────────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  it('customer can place an order', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });
    expect(res.status).toBe(201);
    expect(res.body.order.total).toBeGreaterThan(0);
    expect(res.body.order.orderNumber).toBeDefined();
  });

  it('calculates VAT correctly', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });
    expect(res.status).toBe(201);
    // price=9.99, vat=19% → subtotal=9.99, vatAmount=1.9, total=11.89
    expect(res.body.order.vatAmount).toBeCloseTo(1.9, 1);
  });

  it('rejects order with empty items', async () => {
    const customerToken = await createCustomer();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [], paymentMethod: 'cash_on_delivery', shippingAddress });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no items/i);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(401);
  });
});

// ─── My Orders ───────────────────────────────────────────────────────────────

describe('GET /api/orders/my-orders', () => {
  it('returns orders for logged-in customer', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
  });

  it('returns empty list when no orders', async () => {
    const customerToken = await createCustomer();
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });
});

// ─── Admin — Update Order Status ─────────────────────────────────────────────

describe('PUT /api/orders/admin/:id/status', () => {
  it('admin can update order status', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });

    const orderId = orderRes.body.order._id;
    const res = await request(app)
      .put(`/api/orders/admin/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'processing' });
    expect(res.status).toBe(200);
    expect(res.body.order.orderStatus).toBe('processing');
  });

  it('customer cannot update order status', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });

    const orderId = orderRes.body.order._id;
    const res = await request(app)
      .put(`/api/orders/admin/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderStatus: 'processing' });
    expect(res.status).toBe(403);
  });
});

// ─── Track Order ─────────────────────────────────────────────────────────────

describe('GET /api/orders/track/:orderNumber', () => {
  it('returns order by order number without auth (public)', async () => {
    const adminToken    = await createAdmin();
    const customerToken = await createCustomer();
    const productId     = await createProduct(adminToken);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product: productId, quantity: 1 }], paymentMethod: 'cash_on_delivery', shippingAddress });

    const orderNumber = orderRes.body.order.orderNumber;
    const res = await request(app).get(`/api/orders/track/${orderNumber}`);
    expect(res.status).toBe(200);
    expect(res.body.order.orderNumber).toBe(orderNumber);
  });

  it('returns 404 for unknown order number', async () => {
    const res = await request(app).get('/api/orders/track/FAKE-0000');
    expect(res.status).toBe(404);
  });
});
