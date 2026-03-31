const express  = require('express');
const router   = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name.en');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories (admin)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;