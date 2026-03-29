const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// ─── GET /api/products ───────────────────────────────────────────────────────
// Supports: ?category=ID &type=physical &search=nike &sort=price &page=1
router.get('/', async (req, res) => {
  try {
    const { category, type, search, sort, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (type)     filter.productType = type;
    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.de': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      price:      { price: 1 },
      '-price':   { price: -1 },
      newest:     { createdAt: -1 },
      bestseller: { totalSold: -1 },
      rating:     { averageRating: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      pagination: {
        total,
        page:       Number(page),
        pages:      Math.ceil(total / limit),
        limit:      Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/products/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/products (admin) ──────────────────────────────────────────────
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT /api/products/:id (admin) ───────────────────────────────────────────
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── DELETE /api/products/:id (admin) ────────────────────────────────────────
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;