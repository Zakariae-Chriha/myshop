const express = require('express');
const router  = express.Router();
const Coupon  = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// ─── POST /api/coupons/validate ──────────────────────────────────────────────
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const validity = coupon.isValid(orderAmount);
    if (!validity.valid) {
      return res.status(400).json({ message: validity.message });
    }

    const discount = coupon.calculateDiscount(orderAmount);
    res.json({
      message:       'Coupon is valid',
      discount,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/admin/coupons (admin) ─────────────────────────────────────────
router.post('/admin', protect, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/admin/coupons (admin) ──────────────────────────────────────────
router.get('/admin', protect, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT /api/admin/coupons/:id (admin) ──────────────────────────────────────
router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon updated', coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;