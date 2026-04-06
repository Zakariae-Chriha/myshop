import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import BASE_URL from '../../api/config';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [couponCode,    setCouponCode]    = useState('');
  const [discount,      setDiscount]      = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg,     setCouponMsg]     = useState('');
  const [couponValid,   setCouponValid]   = useState(false);

  const discountedSubtotal = subtotal - discount;
  const vatAmount          = parseFloat((discountedSubtotal * 0.19).toFixed(2));
  const total              = parseFloat((discountedSubtotal + vatAmount).toFixed(2));

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const res  = await fetch(`${BASE_URL}/api/coupons/validate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discount);
        setCouponMsg(`✅ Coupon applied! You save €${data.discount.toFixed(2)}`);
        setCouponValid(true);
        toast.success(`Coupon applied! You save €${data.discount.toFixed(2)}`);
      } else {
        setCouponMsg('❌ ' + (data.message || 'Invalid coupon code'));
        setCouponValid(false);
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponMsg('❌ Something went wrong');
      toast.error('Something went wrong');
    } finally {
      setCouponLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{
        minHeight: '80vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
          <h2 style={{ color: '#F1F5F9', marginBottom: '0.75rem' }}>{t('cart.empty')}</h2>
          <p style={{ color: '#475569', marginBottom: '2rem' }}>
            {t('cart.empty_desc')}
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#F1F5F9', marginBottom: '0.25rem' }}>{t('cart.title')}</h1>
          <p style={{ color: '#475569' }}>{cartItems.length} {t('cart.items')} {t('cart.in_cart')}</p>
        </div>

        <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item._id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '1.25rem',
                display: 'flex', gap: '1rem', alignItems: 'center',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                {/* Image */}
                <div style={{
                  width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                  background: item.images?.[0]
                    ? '#000'
                    : item.productType === 'digital'
                      ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
                      : 'linear-gradient(135deg, #064e3b, #065f46)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name?.en || item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : item.productType === 'digital' ? '💻' : '📦'
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#F1F5F9', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    {item.name?.en || item.name}
                  </div>
                  <span className={`badge ${item.productType === 'digital' ? 'badge-digital' : 'badge-physical'}`}>
                    {item.productType === 'digital' ? '⚡ Digital' : '📦 Physical'}
                  </span>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                    €{(item.priceWithVAT || item.price * 1.19).toFixed(2)} each · incl. VAT
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F1F5F9', fontSize: '1.1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                    −
                  </button>
                  <span style={{ color: '#F1F5F9', fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F1F5F9', fontSize: '1.1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                    +
                  </button>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                  <div style={{ fontWeight: 800, color: '#A5B4FC', fontSize: '1.1rem' }}>
                    €{((item.priceWithVAT || item.price * 1.19) * item.quantity).toFixed(2)}
                  </div>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(item._id)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#FCA5A5', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}>
                  ✕
                </button>
              </div>
            ))}

            {/* Clear cart */}
            <button onClick={clearCart} style={{
              background: 'transparent', color: '#475569',
              border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', textAlign: 'left',
              padding: '0.5rem 0',
              textDecoration: 'underline',
            }}>
              {t('cart.clear_cart')}
            </button>
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '1.75rem',
            position: 'sticky', top: 80,
          }}>
            <h3 style={{ color: '#F1F5F9', marginBottom: '1.5rem' }}>{t('cart.order_summary')}</h3>

            {/* Items breakdown */}
            <div style={{ marginBottom: '1.25rem' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '0.5rem', fontSize: '0.85rem',
                }}>
                  <span style={{ color: '#64748B' }}>
                    {item.name?.en || item.name} ×{item.quantity}
                  </span>
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>
                    €{((item.priceWithVAT || item.price * 1.19) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>{t('cart.subtotal')}</span>
                <span style={{ color: '#94A3B8' }}>€{discountedSubtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#10B981' }}>{t('cart.discount')}</span>
                  <span style={{ color: '#10B981' }}>-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>{t('cart.vat')}</span>
                <span style={{ color: '#475569' }}>€{vatAmount.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '1rem' }}>{t('cart.total')}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#A5B4FC', fontSize: '1.25rem' }}>
                    €{total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>incl. 19% MwSt.</div>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder={t('cart.coupon_placeholder')}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.875rem', fontFamily: 'monospace' }}
                  disabled={couponValid}
                />
                <button onClick={applyCoupon} disabled={couponLoading || couponValid}
                  className="btn btn-outline btn-sm"
                  style={{ flexShrink: 0 }}>
                  {couponLoading ? '...' : t('cart.apply')}
                </button>
              </div>
              {couponMsg && (
                <p style={{
                  fontSize: '0.8rem', marginTop: '0.4rem',
                  color: couponValid ? '#10B981' : '#FCA5A5',
                }}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* Checkout button */}
            <button onClick={() => navigate('/checkout', { state: { couponCode, discount } })}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginBottom: '0.75rem' }}>
              {t('cart.checkout')}
            </button>

            <Link to="/shop" style={{
              display: 'block', textAlign: 'center',
              fontSize: '0.875rem', color: '#475569',
              padding: '0.5rem',
            }}>
              {t('cart.continue')}
            </Link>

            {/* Trust badges */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '1rem',
              marginTop: '1rem', paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['🔒 Secure', '⚡ Instant', '🇩🇪 GDPR'].map(badge => (
                <span key={badge} style={{ fontSize: '0.72rem', color: '#334155' }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;