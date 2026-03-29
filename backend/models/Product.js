const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: [true, 'English name is required'], trim: true },
      de: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },

    description: {
      en: { type: String, default: '' },
      de: { type: String, default: '' },
      ar: { type: String, default: '' },
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Price including 19% German VAT — calculated automatically
    priceWithVAT: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },

    // physical = needs shipping | digital = sends download link
    productType: {
      type: String,
      enum: ['physical', 'digital'],
      required: [true, 'Product type is required'],
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    // Only used when productType is digital
    downloadUrl: {
      type: String,
      default: '',
    },

    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    totalSold: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
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

// ─── Auto-calculate priceWithVAT before saving ──────────────────────────────
// German VAT = 19%
productSchema.pre('save', function (next) {
  if (this.isModified('price')) {
    this.priceWithVAT = parseFloat((this.price * 1.19).toFixed(2));
  }
  next();
});

// ─── Index for fast search ───────────────────────────────────────────────────
productSchema.index({ 'name.en': 'text', 'name.de': 'text', 'name.ar': 'text' });

module.exports = mongoose.model('Product', productSchema);