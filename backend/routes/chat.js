const express = require('express');
const router  = express.Router();
const axios   = require('axios');

// POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'No message provided' });

  // If n8n is configured, use it
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      const r = await axios.post(n8nUrl, { message }, { timeout: 10000 });
      return res.json({ reply: r.data.reply || r.data.output || 'How can I help you?' });
    } catch {
      // fall through to simple responses
    }
  }

  // Simple rule-based responses
  const msg = message.toLowerCase();
  let reply = '';

  if (msg.includes('order') && (msg.includes('track') || msg.includes('status') || msg.includes('where'))) {
    reply = 'You can track your order on the Track Order page. Just enter your order number!';
  } else if (msg.includes('return') || msg.includes('refund')) {
    reply = 'For returns and refunds, please contact us at chrihazakaria@gmail.com with your order number.';
  } else if (msg.includes('payment') || msg.includes('pay') || msg.includes('stripe')) {
    reply = 'We accept credit/debit cards via Stripe and cash on delivery. All payments are secure and encrypted.';
  } else if (msg.includes('shipping') || msg.includes('deliver') || msg.includes('ship')) {
    reply = 'We ship within 2-5 business days. You will receive a tracking number once your order is shipped.';
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('bonjour')) {
    reply = 'Hello! 👋 How can I help you today?';
  } else if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    reply = 'You can see all prices on our Shop page. All prices include 19% VAT.';
  } else if (msg.includes('contact') || msg.includes('email') || msg.includes('support')) {
    reply = 'You can reach us at chrihazakaria@gmail.com. We usually reply within 24 hours.';
  } else if (msg.includes('cancel') || msg.includes('cancell')) {
    reply = 'To cancel an order, please contact us at chrihazakaria@gmail.com as soon as possible with your order number.';
  } else {
    reply = 'Thank you for your message! For further assistance, please email us at chrihazakaria@gmail.com and we will get back to you within 24 hours.';
  }

  res.json({ reply });
});

module.exports = router;
