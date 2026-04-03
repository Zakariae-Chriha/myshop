/**
 * Run this script to create a new admin account:
 *   node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@zcbrands.de';   // ← change if you want
const ADMIN_PASSWORD = 'Admin1234!';           // ← change this!

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // Load model after connection
  const User = require('./models/User');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Update role and reset password
    existing.role     = 'admin';
    existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    existing.isActive = true;
    await existing.save({ validateBeforeSave: false });
    console.log('✅ Existing user updated to admin:', ADMIN_EMAIL);
  } else {
    await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role:     'admin',
      isActive: true,
    });
    console.log('✅ New admin created:', ADMIN_EMAIL);
  }

  console.log('   Email:   ', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
