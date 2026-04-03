const express = require('express');
const router  = express.Router();
const https   = require('https');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── Step 1: Redirect to Google ───────────────────────────────────────────────
router.get('/google', (req, res) => {
  try {
    console.log('[OAuth] /google hit');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const secret   = process.env.GOOGLE_CLIENT_SECRET;
    console.log('[OAuth] clientId:', clientId ? 'SET' : 'MISSING');
    console.log('[OAuth] secret:', secret ? (secret === 'your_google_client_secret' ? 'PLACEHOLDER' : 'SET') : 'MISSING');

    if (!clientId || !secret || secret === 'your_google_client_secret') {
      return res.status(503).json({
        message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
      });
    }

    const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  callbackURL,
      response_type: 'code',
      scope:         'openid profile email',
      access_type:   'offline',
      prompt:        'select_account',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('[OAuth] redirecting to:', url.slice(0, 80) + '...');
    res.redirect(url);
  } catch (err) {
    console.error('[OAuth] /google error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Step 2: Google redirects back ───────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3005';

  if (error || !code) {
    return res.redirect(`${frontend}/login?error=oauth_denied`);
  }

  try {
    const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/oauth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  callbackURL,
        grant_type:    'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();

    if (!tokenRes.ok || tokens.error) {
      console.error('Token exchange error:', tokens);
      return res.redirect(`${frontend}/login?error=token_exchange`);
    }

    // Get user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return res.redirect(`${frontend}/login?error=no_email`);
    }

    // Find or create user
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.picture;
        await user.save();
      } else {
        const crypto = require('crypto');
        user = await User.create({
          name:     profile.name,
          email:    profile.email,
          googleId: profile.id,
          avatar:   profile.picture || '',
          password: crypto.randomBytes(32).toString('hex'),
          isActive: true,
        });
      }
    }

    const token = generateToken(user._id);
    res.redirect(`${frontend}/oauth-callback?token=${token}`);

  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${frontend}/login?error=server`);
  }
});

module.exports = router;
