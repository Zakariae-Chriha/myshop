const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const { triggerPasswordReset } = require('../utils/n8nWebhook');

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', { expiresIn: '30d' });

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Keep backward-compat alias used by older code paths
const generateToken = generateAccessToken;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, language });
    setRefreshCookie(res, generateRefreshToken(user._id));
    res.status(201).json({
      message: 'Account created successfully',
      token:   generateAccessToken(user._id),
      user:    user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
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
    setRefreshCookie(res, generateRefreshToken(user._id));
    res.json({
      message: 'Login successful',
      token:   generateAccessToken(user._id),
      user:    user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/refresh — exchange refresh cookie for new access token
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const secret  = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    const decoded = jwt.verify(token, secret);
    const newAccess = generateAccessToken(decoded.id);
    res.json({ token: newAccess });
  } catch {
    res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
});

// POST /api/auth/logout — clear refresh cookie
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ user: req.user.toPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/me
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    const resetToken   = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 60 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:   resetToken,
      resetPasswordExpires: resetExpires,
    });
    triggerPasswordReset({
      customerName:  user.name,
      customerEmail: user.email,
      resetLink:     `${process.env.FRONTEND_URL || 'http://localhost:3005'}/reset-password/${resetToken}`,
    });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken:   req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }
    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/customers
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

// GET /api/admin/admins
router.get('/admins', protect, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/create-admin
router.post('/create-admin', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({
      message: 'Admin created successfully',
      user:    user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/admins/:id
router.delete('/admins/:id', protect, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndUpdate(req.params.id, { role: 'customer' });
    res.json({ message: 'Admin removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

// GET /api/auth/wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/wishlist/:productId — toggle add/remove
router.put('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user      = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx       = user.wishlist.findIndex(id => id.toString() === productId);

    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ wishlist: user.wishlist, added: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;