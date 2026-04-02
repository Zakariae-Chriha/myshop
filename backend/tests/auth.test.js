require('./setup');
const request = require('supertest');
const app     = require('../app');

// ─── Helpers ────────────────────────────────────────────────────────────────

const registerUser = (data = {}) =>
  request(app).post('/api/auth/register').send({
    name:     'Test User',
    email:    'test@example.com',
    password: 'password123',
    ...data,
  });

const loginUser = (data = {}) =>
  request(app).post('/api/auth/login').send({
    email:    'test@example.com',
    password: 'password123',
    ...data,
  });

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new account and returns a token', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects duplicate email', async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects missing name', async () => {
    const res = await registerUser({ name: '' });
    expect(res.status).toBe(500);
  });

  it('rejects short password', async () => {
    const res = await registerUser({ password: '123' });
    expect(res.status).toBe(500);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  it('logs in with correct credentials', async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects wrong password', async () => {
    const res = await loginUser({ password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('rejects unknown email', async () => {
    const res = await loginUser({ email: 'nobody@example.com' });
    expect(res.status).toBe(401);
  });
});

// ─── Get Profile ─────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns profile with valid token', async () => {
    await registerUser();
    const { body } = await loginUser();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─── Update Profile ──────────────────────────────────────────────────────────

describe('PUT /api/auth/me', () => {
  it('updates name and phone', async () => {
    await registerUser();
    const { body } = await loginUser();
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ name: 'Updated Name', phone: '+49123456789' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
    expect(res.body.user.phone).toBe('+49123456789');
  });
});

// ─── Forgot Password ─────────────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  it('returns success for registered email', async () => {
    await registerUser();
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/sent/i);
  });

  it('returns 404 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });
    expect(res.status).toBe(404);
  });
});

// ─── Reset Password ──────────────────────────────────────────────────────────

describe('POST /api/auth/reset-password/:token', () => {
  it('resets password with valid token', async () => {
    await registerUser();
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });

    const User = require('../models/User');
    const user = await User.findOne({ email: 'test@example.com' });
    const token = user.resetPasswordToken;

    const res = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .send({ password: 'newpassword123' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);

    // Verify new password works
    const login = await loginUser({ password: 'newpassword123' });
    expect(login.status).toBe(200);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/invalidtoken123')
      .send({ password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or has expired/i);
  });
});
