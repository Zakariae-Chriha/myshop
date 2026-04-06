const axios = require('axios');
const tmpl = require('./emailTemplates');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'chrihazakaria@gmail.com';
const FROM_EMAIL  = process.env.FROM_EMAIL  || 'onboarding@resend.dev';

const send = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Email] RESEND_API_KEY not set — skipping:', subject);
    return;
  }
  try {
    await axios.post('https://api.resend.com/emails', {
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('[Email] Sent:', subject, '→', to);
  } catch (err) {
    console.error('[Email] Failed:', err.response?.data || err.message);
  }
};

const sendOrderConfirmed = (data) => send({
  to:      data.customerEmail,
  subject: `✅ Order Confirmed — ${data.orderNumber}`,
  html:    tmpl.orderConfirmed(data),
});

const sendOrderShipped = (data) => send({
  to:      data.customerEmail,
  subject: `📦 Your order ${data.orderNumber} has shipped!`,
  html:    tmpl.orderShipped(data),
});

const sendOrderDelivered = (data) => send({
  to:      data.customerEmail,
  subject: `🎉 Order ${data.orderNumber} delivered — thank you!`,
  html:    tmpl.orderDelivered(data),
});

const sendPasswordReset = (data) => send({
  to:      data.customerEmail,
  subject: '🔐 Reset your password',
  html:    tmpl.passwordReset(data),
});

const sendLowStockAlert = (data) => send({
  to:      ADMIN_EMAIL,
  subject: `⚠️ Low Stock Alert: ${data.productName}`,
  html:    tmpl.lowStockAlert(data),
});

module.exports = {
  sendOrderConfirmed,
  sendOrderShipped,
  sendOrderDelivered,
  sendPasswordReset,
  sendLowStockAlert,
};
