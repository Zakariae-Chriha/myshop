import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripePaymentForm = ({ orderId, onSuccess, onError }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const res = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        onError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <div style={{
        border: '1.5px solid #D1D5DB', borderRadius: 10,
        padding: '0.85rem 1rem', marginBottom: '1rem', background: '#fff',
      }}>
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#1F2937', '::placeholder': { color: '#9CA3AF' } },
            invalid: { color: '#EF4444' },
          },
        }} />
      </div>
      <div style={{
        background: '#EEF0FF', borderRadius: 8, padding: '0.6rem 1rem',
        fontSize: '0.8rem', color: '#6C63FF', marginBottom: '1rem',
      }}>
        Test card: 4242 4242 4242 4242 · Any future date · Any CVC
      </div>
      <button type="submit" disabled={!stripe || paying} className="btn btn-primary btn-full btn-lg">
        {paying ? 'Processing payment...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const { couponCode = '', discount = 0 } = location.state || {};

  const discountedSubtotal = subtotal - discount;
  const vatAmount = parseFloat((discountedSubtotal * 0.19).toFixed(2));
  const total     = parseFloat((discountedSubtotal + vatAmount).toFixed(2));

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    street: '', city: '', zip: '',
    country: 'Germany', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [notes,         setNotes]         = useState('');
  const [orderId,       setOrderId]       = useState(null);
  const [error,         setError]         = useState('');
  const [placingOrder,  setPlacingOrder]  = useState(false);
  const [orderPlaced,   setOrderPlaced]   = useState(false);

  const handleAddress = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    if (!address.fullName || !address.street || !address.city || !address.zip) {
      return setError('Please fill in all address fields');
    }
    setPlacingOrder(true);
    setError('');
    try {
      const items = cartItems.map(i => ({ product: i._id, quantity: i.quantity }));
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ items, shippingAddress: address, paymentMethod, couponCode, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (paymentMethod === 'cash_on_delivery') {
        clearCart();
        navigate('/order-confirm', { state: { order: data.order } });
      } else {
        setOrderId(data.order._id);
        setOrderPlaced(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async () => {
  try {
    await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ paymentStatus: 'paid', orderStatus: 'processing' }),
    });
  } catch (err) {
    console.log('Status update error:', err);
  }
  clearCart();
  navigate('/order-confirm', { state: { order: { orderNumber: orderId, total } } });
};

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          <div>
            {error && <div className="alert alert-error">{error}</div>}

            {!orderPlaced ? (
              <>
                {/* Shipping address */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #F3F4F6' }}>
                  <h3 style={{ marginBottom: '1.25rem' }}>Shipping Address</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Full Name</label>
                      <input name="fullName" value={address.fullName} onChange={handleAddress} className="form-input" placeholder="Your full name" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Street Address</label>
                      <input name="street" value={address.street} onChange={handleAddress} className="form-input" placeholder="Street and number" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input name="city" value={address.city} onChange={handleAddress} className="form-input" placeholder="City" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ZIP Code</label>
                      <input name="zip" value={address.zip} onChange={handleAddress} className="form-input" placeholder="12345" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input name="country" value={address.country} onChange={handleAddress} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input name="phone" value={address.phone} onChange={handleAddress} className="form-input" placeholder="+49 123 456789" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Order Notes (optional)</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-input" rows={3} placeholder="Any special instructions..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6' }}>
                  <h3 style={{ marginBottom: '1.25rem' }}>Payment Method</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                      { value: 'stripe',          icon: '💳', label: 'Pay with Card (Stripe)', desc: 'Visa, Mastercard, American Express' },
                      { value: 'cash_on_delivery', icon: '💵', label: 'Cash on Delivery',       desc: 'Pay when your order arrives' },
                    ].map(opt => (
                      <label key={opt.value} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${paymentMethod === opt.value ? '#6C63FF' : '#E5E7EB'}`,
                        background: paymentMethod === opt.value ? '#EEF0FF' : '#fff',
                        transition: 'all 0.2s',
                      }}>
                        <input type="radio" value={opt.value} checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)} style={{ display: 'none' }} />
                        <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{opt.desc}</div>
                        </div>
                        {paymentMethod === opt.value && (
                          <span style={{ marginLeft: 'auto', color: '#6C63FF', fontWeight: 700 }}>✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <button onClick={placeOrder} disabled={placingOrder} className="btn btn-primary btn-full btn-lg">
                    {placingOrder ? 'Placing order...' : paymentMethod === 'stripe' ? 'Continue to Payment' : 'Place Order'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Enter Card Details</h3>
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setError(msg)}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6', position: 'sticky', top: 80 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
            <div style={{ marginBottom: '1rem' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.875rem' }}>
                  <span>{item.name?.en || item.name} x{item.quantity}</span>
                  <span style={{ fontWeight: 500 }}>€{((item.priceWithVAT || item.price * 1.19) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#374151' }}>Subtotal (net)</span>
                <span>€{discountedSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#9CA3AF' }}>VAT (19%)</span>
                <span style={{ color: '#9CA3AF' }}>€{vatAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid #F3F4F6' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: '#6C63FF', fontSize: '1.1rem' }}>€{total.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'right', marginTop: 4 }}>incl. 19% MwSt.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;