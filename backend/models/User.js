const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },

    language: {
      type: String,
      enum: ['en', 'de', 'ar'],
      default: 'en',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      zip:     { type: String, default: '' },
      country: { type: String, default: 'Germany' },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Hash password before saving ───────────────────────────────────────────
// This runs automatically every time a user is created or password changed
userSchema.pre('save', async function (next) {
  // Only hash if password was changed (not on every save)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method to check password at login ─────────────────────────────────────
// Usage: const isMatch = await user.comparePassword(enteredPassword)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Method to get public profile (no password) ────────────────────────────
// Usage: const profile = user.toPublicProfile()
userSchema.methods.toPublicProfile = function () {
  return {
    _id:      this._id,
    name:     this.name,
    email:    this.email,
    role:     this.role,
    language: this.language,
    phone:    this.phone,
    address:  this.address,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);