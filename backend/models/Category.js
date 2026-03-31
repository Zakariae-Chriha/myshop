const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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
    slug:     { type: String, unique: true, lowercase: true, trim: true },
    image:    { type: String, default: '' },
    icon:     { type: String, default: '📦' },
    color:    { type: String, default: '#6C63FF' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function () {
  if (this.isModified('name.en')) {
    this.slug = this.name.en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
});

module.exports = mongoose.model('Category', categorySchema);