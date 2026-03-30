import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [coupon,      setCoupon]      = useState('');
  const [discount,    setDiscount]    = useState(0);
  const [couponMsg,   setCouponMsg]   = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [applying,    setApplying]    = useState(false);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    setCouponMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code: coupon, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount);
        setCouponValid(true);
        setCouponMsg(`Coupon applied — you save €${data.discount.toFixed(2)}`);
      } else {
        setCouponMsg(data.message);
        setCouponValid(false);
        setDiscount(0);
      }
    } catch {
      setCouponMsg('Could not apply coupon');
    } finally {
      setApplying(false);
    }
  };

  const discountedSubtotal = subtotal - discount;
  const finalVAT   = parseFloat((discountedSubtotal * 0.19).toFixed(2));
  const finalTotal = parseFloat((discountedSubtotal + finalVAT).toFixed(2));

  const handleCheckout = () => {
    if (!user) return navigate('/login');
    navigate('/checkout', { state: { couponCode: couponValid ? coupon : '', discount } });
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Add some products to get started</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          <div>
            {cartItems.map(item => (
              <div key={item._id} style={{
                background: '#fff', borderRadius: 16, padding: '1.25rem',
                marginBottom: '1rem', border: '1px solid #F3F4F6',
                display: 'flex', gap: '1.25rem', alignItems: 'center',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                  background: item.productType === 'digital'
                    ? 'linear-gradient(135deg, #EEF0FF, #C7D2FE)'
                    : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  {item.productType === 'digital' ? '💻' : '📦'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {item.name?.en || item.name}
                  </div>
                  <span className={`badge ${item.productType === 'digital' ? 'badge-digital' : 'badge-physical'}`}>
                    {item.productType === 'digital' ? '⚡ Digital' : '📦 Physical'}
                  </span>
                  <div style={{ marginTop: 8, color: '#6C63FF', fontWeight: 700 }}>
                    €{((item.priceWithVAT || item.price * 1.19) * item.quantity).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    €{(item.priceWithVAT || item.price * 1.19).toFixed(2)} each · incl. VAT
                  </div>
                </div>

                {item.productType !== 'digital' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: '1rem' }}>
                      -
                    </button>
                    <span style={{ width: 28, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: '1rem' }}>
                      +
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Qty: 1</div>
                )}

                <button onClick={() => removeFromCart(item._id)}
                  style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  X
                </button>
              </div>
            ))}

            <button onClick={clearCart}
              style={{ color: '#6B7280', background: 'none', border: 'none', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear cart
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6', position: 'sticky', top: 80 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#374151' }}>Subtotal (net)</span>
              <span style={{ fontWeight: 500 }}>€{discountedSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#9CA3AF' }}>VAT (19%)</span>
              <span style={{ color: '#9CA3AF' }}>€{finalVAT.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#374151' }}>Discount</span>
                <span style={{ color: '#10B981', fontWeight: 500 }}>-€{discount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ borderTop: '2px solid #F3F4F6', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#6C63FF' }}>
                  €{finalTotal.toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right', marginTop: 2 }}>
                incl. 19% MwSt.
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.875rem' }}
                />
                <button onClick={applyCoupon} disabled={applying || couponValid}
                  className="btn btn-outline btn-sm">
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
              {couponMsg && (
                <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: couponValid ? '#10B981' : '#DC2626' }}>
                  {couponMsg}
                </p>
              )}
            </div>

            <button onClick={handleCheckout} className="btn btn-primary btn-full btn-lg">
              Proceed to Checkout
            </button>

            <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', color: '#6B7280' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;