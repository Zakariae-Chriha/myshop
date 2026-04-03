const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
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
        const updated = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity, totalSold: item.quantity } },
          { new: true }
        );
        // Fire low-stock alert if stock fell at or below threshold
        if (updated && updated.stock <= updated.lowStockThreshold) {
          triggerN8n('low_stock', {
            productName:   updated.name.en,
            currentStock:  updated.stock,
            threshold:     updated.lowStockThreshold,
            productId:     updated._id.toString(),
          });
        }
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

// GET /api/orders/admin/analytics?period=day|month|year
router.get('/admin/analytics', protect, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'week'; // day, week, month, year

    let startDate = new Date();
    let groupFormat, days, labelFormat;

    if (period === 'day') {
      // Today hourly — last 24h
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      groupFormat  = '%Y-%m-%dT%H';
      days         = 24;
      labelFormat  = 'hour';
    } else if (period === 'month') {
      // Last 30 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      groupFormat  = '%Y-%m-%d';
      days         = 30;
      labelFormat  = 'day';
    } else if (period === 'year') {
      // Last 12 months
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      groupFormat  = '%Y-%m';
      days         = 12;
      labelFormat  = 'month';
    } else {
      // Default: last 7 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupFormat  = '%Y-%m-%d';
      days         = 7;
      labelFormat  = 'day';
    }

    const daily = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id:     { $dateToString: { format: groupFormat, date: '$createdAt' } },
        revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Fill missing slots with zeros
    const filledDaily = [];
    if (labelFormat === 'month') {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        const key   = d.toISOString().slice(0, 7);
        const found = daily.find(x => x._id === key);
        filledDaily.push({ date: key, revenue: found?.revenue || 0, orders: found?.orders || 0 });
      }
    } else if (labelFormat === 'hour') {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 13);
        const found = daily.find(x => x._id === key);
        filledDaily.push({ date: key.slice(11) + 'h', revenue: found?.revenue || 0, orders: found?.orders || 0 });
      }
    } else {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key   = d.toISOString().slice(0, 10);
        const found = daily.find(x => x._id === key);
        filledDaily.push({ date: key, revenue: found?.revenue || 0, orders: found?.orders || 0 });
      }
    }

    // Summary totals for the period
    const summary = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id:          null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
        totalOrders:  { $sum: 1 },
        totalItems:   { $sum: { $size: '$items' } },
      }},
    ]);

    // Status breakdown for the period
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Top 5 products by revenue for the period
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
        _id:       '$items.name',
        totalSold: { $sum: '$items.quantity' },
        revenue:   { $sum: { $multiply: ['$items.priceWithVAT', '$items.quantity'] } },
      }},
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      daily: filledDaily,
      statusBreakdown,
      topProducts,
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, totalItems: 0 },
      period,
      from: startDate.toISOString().slice(0, 10),
      to:   new Date().toISOString().slice(0, 10),
    });
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

// GET /api/orders/admin/shipped-followup — orders shipped >3 days, not yet delivered
router.get('/admin/shipped-followup', protect, isAdmin, async (req, res) => {
  try {
    const days    = parseInt(req.query.days) || 3;
    const cutoff  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orders  = await Order.find({
      orderStatus: 'shipped',
      shippedAt:   { $lte: cutoff },
    }).populate('customer', 'name email').sort({ shippedAt: 1 });
    res.json({ orders, count: orders.length });
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

    // Auto-mark COD orders as paid when delivered
    if (orderStatus === 'delivered') {
      update.paymentStatus = 'paid';
      update.deliveredAt   = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Trigger delivery confirmation email if delivered
    if (orderStatus === 'delivered') {
      triggerN8n('order_delivered', {
        orderNumber:   order.orderNumber,
        customerName:  order.customer.name,
        customerEmail: order.customer.email,
        total:         order.total,
        paymentMethod: order.paymentMethod,
        deliveredAt:   order.deliveredAt,
      });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/admin/:id/tracking
router.put('/admin/:id/tracking', protect, isAdmin, async (req, res) => {
  try {
    const { trackingNumber, trackingCarrier } = req.body;
    const deliveryToken = crypto.randomBytes(32).toString('hex');

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber, trackingCarrier, orderStatus: 'shipped', shippedAt: new Date(), deliveryToken },
      { new: true }
    ).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const confirmLink = `${process.env.FRONTEND_URL}/confirm-delivery/${deliveryToken}`;
    triggerN8n('order_shipped', {
      orderNumber:   order.orderNumber,
      customerName:  order.customer.name,
      customerEmail: order.customer.email,
      trackingNumber,
      trackingCarrier,
      confirmLink,
      shippedAt:     order.shippedAt,
    });

    res.json({ message: 'Tracking number added', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/confirm-delivery/:token (public — customer clicks link from email)
router.get('/confirm-delivery/:token', async (req, res) => {
  try {
    const order = await Order.findOne({ deliveryToken: req.params.token });
    if (!order) return res.status(404).json({ message: 'Invalid or expired link' });
    if (order.orderStatus === 'delivered') {
      return res.json({ message: 'Already confirmed', orderNumber: order.orderNumber });
    }

    order.orderStatus        = 'delivered';
    order.paymentStatus      = 'paid';
    order.deliveredAt        = new Date();
    order.deliveryConfirmedAt = new Date();
    order.deliveryToken      = ''; // invalidate token
    await order.save();

    res.json({ message: 'Delivery confirmed', orderNumber: order.orderNumber });
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