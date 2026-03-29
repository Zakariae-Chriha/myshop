const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// ─── POST /api/reviews ───────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = await Review.create({
      product,
      user:    req.user._id,
      rating,
      comment,
    });

    res.status(201).json({ message: 'Review submitted — pending approval', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/reviews/:productId ─────────────────────────────────────────────
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      product:    req.params.productId,
      isApproved: true,
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT /api/admin/reviews/:id/approve (admin) ──────────────────────────────
router.put('/admin/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.updateProductRating(review.product);
    res.json({ message: 'Review approved', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── DELETE /api/admin/reviews/:id (admin) ───────────────────────────────────
router.delete('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.updateProductRating(review.product);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;