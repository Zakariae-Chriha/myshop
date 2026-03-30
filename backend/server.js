const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Review');
require('./models/Coupon');
require('./models/Category');

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/coupons',    require('./routes/coupons'));
app.use('/api/payments',   require('./routes/payments'));

app.get('/', (req, res) => {
  res.json({ message: 'MyShop API is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port ' + (process.env.PORT || 5000));
    });
  })
  .catch((err) => console.log('MongoDB error:', err));