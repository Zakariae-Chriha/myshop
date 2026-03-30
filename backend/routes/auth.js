const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
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

router.get('/me', protect, async (req, res) => {
  try {
    res.json({ user: req.user.toPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address, language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, language },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated', user: user.toPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin — get all customers
router.get('/customers', protect, isAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;