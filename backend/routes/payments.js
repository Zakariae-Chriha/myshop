const express     = require('express');
const router      = express.Router();
const Order       = require('../models/Order');
const stripe      = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { protect } = require('../middleware/auth');

router.post('/create-intent', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(order.total * 100),
      currency: 'eur',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: paymentIntent.id });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/confirm — called by frontend after successful Stripe payment
router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify payment with Stripe directly
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not confirmed by Stripe' });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus:   'processing',
    });

    res.json({ message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig   = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const orderId = event.data.object.metadata.orderId;
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', orderStatus: 'processing' });
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;