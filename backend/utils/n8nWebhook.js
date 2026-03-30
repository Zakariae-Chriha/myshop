const axios = require('axios');

const triggerN8n = async (event, data) => {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      console.log('N8N_WEBHOOK_URL not set — skipping');
      return;
    }
    await axios.post(n8nUrl, { event, data });
    console.log(`n8n triggered: ${event}`);
  } catch (err) {
    console.log('n8n webhook error:', err.message);
  }
};

module.exports = { triggerN8n };