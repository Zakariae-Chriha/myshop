const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper — generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user — password is hashed automatically by User model pre-save hook
    const user = await User.create({ name, email, password, language });

    res.status(201).json({
      message: 'Account created successfully',
      token: generateToken(user._id),
      user:  user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user:  user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ user: req.user.toPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT /api/auth/me ────────────────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address, language } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, language },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated',
      user: user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;