const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true }, // saved at time of purchase
  price:       { type: Number, required: true }, // price without VAT
  priceWithVAT:{ type: Number, required: true }, // price with VAT
  quantity:    { type: Number, required: true, min: 1 },
  productType: { type: String, enum: ['physical', 'digital'] },
  image:       { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    // Auto-generated readable order number e.g. ORD-1001
    orderNumber: {
      type: String,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [orderItemSchema],

    // Pricing breakdown (required by German law)
    subtotal:  { type: Number, required: true }, // without VAT
    vatAmount: { type: Number, required: true }, // VAT amount (19%)
    vatRate:   { type: Number, default: 19 },    // VAT percentage
    discount:  { type: Number, default: 0 },     // coupon discount
    total:     { type: Number, required: true },  // final amount with VAT

    couponCode: { type: String, default: '' },

    paymentMethod: {
      type: String,
      enum: ['stripe', 'cash_on_delivery'],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // stripe only
    stripePaymentIntentId: { type: String, default: '' },

    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    shippingAddress: {
      fullName: { type: String, default: '' },
      street:   { type: String, default: '' },
      city:     { type: String, default: '' },
      zip:      { type: String, default: '' },
      country:  { type: String, default: 'Germany' },
      phone:    { type: String, default: '' },
    },

    // Added by admin when physical order is shipped
    trackingNumber:  { type: String, default: '' },
    trackingCarrier: { type: String, default: '' }, // DHL, UPS, etc.
    shippedAt:       { type: Date },
    deliveredAt:     { type: Date },

    // n8n notification flags
    confirmationEmailSent: { type: Boolean, default: false },
    trackingEmailSent:     { type: Boolean, default: false },
    downloadEmailSent:     { type: Boolean, default: false },

    notes: { type: String, default: '' }, // customer notes at checkout
  },
  {
    timestamps: true,
  }
);

// ─── Auto-generate order number before saving ────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${1000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);