require('dotenv').config();
const mongoose = require('mongoose');
const app      = require('./app');

const PORT = process.env.PORT || 5000;

// Start listening immediately so Render's port scan succeeds
const server = app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

// Connect to MongoDB (retries automatically)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Don't exit — mongoose will retry automatically
  });
