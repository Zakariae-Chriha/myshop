const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true, // always stored as uppercase e.g. SUMMER20
      trim: true,
    },

    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: [true, 'Discount type is required'],
    },

    // percent: 20 means 20% off | fixed: 10 means €10 off
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },

    // Minimum order amount to use this coupon
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    // How many times this coupon can be used total
    usageLimit: {
      type: Number,
      default: 100,
    },

    // How many times it has been used so far
    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Check if coupon is still valid ─────────────────────────────────────────
couponSchema.methods.isValid = function (orderAmount) {
  const now = new Date();

  if (!this.isActive)                       return { valid: false, message: 'Coupon is inactive' };
  if (now > this.expiryDate)                return { valid: false, message: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit)    return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount)    return { valid: false, message: `Minimum order amount is €${this.minOrderAmount}` };

  return { valid: true, message: 'Coupon is valid' };
};

// ─── Calculate discount amount ───────────────────────────────────────────────
couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (this.discountType === 'percent') {
    return parseFloat(((orderAmount * this.discountValue) / 100).toFixed(2));
  }
  return parseFloat(Math.min(this.discountValue, orderAmount).toFixed(2));
};

module.exports = mongoose.model('Coupon', couponSchema);