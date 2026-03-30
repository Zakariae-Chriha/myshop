const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Coupon  = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const { triggerN8n } = require('../utils/n8nWebhook');

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.productType === 'physical' && product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for: ${product.name.en}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product:      product._id,
        name:         product.name.en,
        price:        product.price,
        priceWithVAT: product.priceWithVAT,
        quantity:     item.quantity,
        productType:  product.productType,
        image:        product.images[0] || '',
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validity = coupon.isValid(subtotal);
        if (validity.valid) {
          discount = coupon.calculateDiscount(subtotal);
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const discountedSubtotal = subtotal - discount;
    const vatAmount = parseFloat((discountedSubtotal * 0.19).toFixed(2));
    const total     = parseFloat((discountedSubtotal + vatAmount).toFixed(2));

    const order = await Order.create({
      customer:       req.user._id,
      items:          orderItems,
      subtotal:       parseFloat(discountedSubtotal.toFixed(2)),
      vatAmount,
      discount,
      total,
      couponCode:     couponCode || '',
      paymentMethod,
      shippingAddress,
      notes:          notes || '',
    });

    for (const item of orderItems) {
      if (item.productType === 'physical') {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, totalSold: item.quantity },
        });
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email');

    // Trigger n8n automation
    triggerN8n('order_created', {
      orderNumber:   order.orderNumber,
      customerName:  populatedOrder.customer.name,
      customerEmail: populatedOrder.customer.email,
      total:         order.total,
      vatAmount:     order.vatAmount,
      paymentMethod: order.paymentMethod,
      items:         order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.priceWithVAT })),
      createdAt:     order.createdAt,
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order:   populatedOrder,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/track/:orderNumber (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber orderStatus paymentStatus trackingNumber trackingCarrier shippedAt createdAt items');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/admin/all
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const { status, payment, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)  filter.orderStatus   = status;
    if (payment) filter.paymentStatus = payment;
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/admin/:id/status
router.put('/admin/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus)   update.orderStatus   = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/admin/:id/tracking
router.put('/admin/:id/tracking', protect, isAdmin, async (req, res) => {
  try {
    const { trackingNumber, trackingCarrier } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber, trackingCarrier, orderStatus: 'shipped', shippedAt: new Date() },
      { new: true }
    ).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Tracking number added', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id — must come LAST
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;