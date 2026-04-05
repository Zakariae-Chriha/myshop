require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const rateLimit      = require('express-rate-limit');
const helmet         = require('helmet');
const cookieParser   = require('cookie-parser');

const app = express();
app.set('trust proxy', 1);

// ─── Rate Limiters ───────────────────────────────────────────────────────────

// Auth routes: max 10 requests per 15 minutes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API: max 100 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from frontend
  contentSecurityPolicy: false, // managed by frontend
}));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://myshop-pi-dun.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3005',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
}

require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Review');
require('./models/Coupon');
require('./models/Category');

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/coupons',    require('./routes/coupons'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/admin',      require('./routes/auth'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/oauth',      require('./routes/oauth'));

app.get('/', (req, res) => {
  res.json({ message: 'MyShop API is running!' });
});

// ─── Sitemap ─────────────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Product  = require('./models/Product');
    const Category = require('./models/Category');
    const base     = process.env.FRONTEND_URL || 'http://localhost:3005';

    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select('_id updatedAt').lean(),
      Category.find().select('slug updatedAt').lean(),
    ]);

    const staticPages = ['', '/shop', '/track', '/cart'];
    const now = new Date().toISOString().slice(0, 10);

    const urls = [
      ...staticPages.map(path => `
  <url>
    <loc>${base}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...categories.map(c => `
  <url>
    <loc>${base}/shop?category=${c._id}</loc>
    <lastmod>${c.updatedAt?.toISOString().slice(0, 10) || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...products.map(p => `
  <url>
    <loc>${base}/product/${p._id}</loc>
    <lastmod>${p.updatedAt?.toISOString().slice(0, 10) || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Sitemap error');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

module.exports = app;
