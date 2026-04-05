const { Resend } = require('resend');
const tmpl = require('./emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'chrihazakaria@gmail.com';

const send = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — skipping:', subject);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) console.error('[Email] Resend error:', error);
    else console.log('[Email] Sent:', subject, '→', to);
  } catch (err) {
    console.error('[Email] Failed:', err.message);
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
