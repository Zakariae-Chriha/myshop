const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//const salt = await bcrypt.genSalt(10);
require('dotenv').config();
// Models — import all so Mongoose registers them
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Review');
require('./models/Coupon');
require('./models/Category');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route — remove this later
app.get('/', (req, res) => {
  res.json({ message: 'MyShop API is running!' });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});