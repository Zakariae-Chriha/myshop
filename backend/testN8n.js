const axios = require('axios');

axios.post('http://localhost:5678/webhook-test/myshop-orders', {
  event: 'order_created',
  data: {
    orderNumber:   'ORD-TEST',
    customerName:  'Test User',
    customerEmail: 'chrihazakaria@gmail.com',
    total:         47.59,
    vatAmount:     7.59,
    paymentMethod: 'stripe',
    items: [{ name: 'React JS Complete Course', quantity: 1, price: 59.49 }],
  }
}).then(res => {
  console.log('n8n triggered successfully!', res.status);
}).catch(err => {
  console.log('Error:', err.message);
});