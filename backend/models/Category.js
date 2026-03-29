const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // Name in all 3 languages
    name: {
      en: { type: String, required: [true, 'English name is required'], trim: true },
      de: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },

    // URL-friendly version e.g. "mens-clothing"
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image:    { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-generate slug from English name ────────────────────────────────────
categorySchema.pre('save', function (next) {
  if (this.isModified('name.en')) {
    this.slug = this.name.en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);