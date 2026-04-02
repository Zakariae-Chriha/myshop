const axios = require('axios');
const tmpl  = require('./emailTemplates');

const subjectMap = {
  order_created:   (d) => `✅ Order Confirmed — ${d.orderNumber}`,
  order_shipped:   (d) => `📦 Your order ${d.orderNumber} has shipped!`,
  order_delivered: (d) => `🎉 Order ${d.orderNumber} delivered — thank you!`,
  low_stock:       (d) => `⚠️ Low Stock Alert: ${d.productName}`,
};

const htmlMap = {
  order_created:   (d) => tmpl.orderConfirmed(d),
  order_shipped:   (d) => tmpl.orderShipped(d),
  order_delivered: (d) => tmpl.orderDelivered(d),
  low_stock:       (d) => tmpl.lowStockAlert(d),
};

const triggerN8n = async (event, data) => {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.log('N8N_WEBHOOK_URL not set — skipping');
      return;
    }

    const enriched = {
      ...data,
      subject:  subjectMap[event]?.(data) || event,
      htmlBody: htmlMap[event]?.(data)    || '',
    };

    await axios.post(n8nUrl, { event, data: enriched });
    console.log(`n8n triggered: ${event}`);
  } catch (err) {
    console.log('n8n webhook error:', err.message);
  }
};

// Password reset uses a separate webhook URL
const triggerPasswordReset = async (data) => {
  try {
    const url = process.env.N8N_PASSWORD_RESET_URL;
    if (!url) return;

    await axios.post(url, {
      ...data,
      subject:  '🔐 Reset your DigitalShop password',
      htmlBody: tmpl.passwordReset(data),
    });
    console.log('n8n triggered: password_reset');
  } catch (err) {
    console.log('n8n password reset webhook error:', err.message);
  }
};

module.exports = { triggerN8n, triggerPasswordReset };
