import { useLocation, Link } from 'react-router-dom';
import { generateInvoice } from '../../utils/generateInvoice';

const OrderConfirm = () => {
  const location = useLocation();
  const order    = location.state?.order;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '3rem 2.5rem',
        maxWidth: 520, width: '100%', textAlign: 'center',
        position: 'relative', zIndex: 1,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 1.5rem',
          boxShadow: '0 0 40px rgba(16,185,129,0.3)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          ✓
        </div>

        <h1 style={{ color: '#F1F5F9', marginBottom: '0.75rem', fontSize: '1.75rem' }}>
          Order Confirmed! 🎉
        </h1>
        <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: 1.6 }}>
          Thank you for your purchase! You will receive a confirmation email shortly.
        </p>

        {/* Order details */}
        {order && (
          <div style={{
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: 16, padding: '1.5rem', marginBottom: '2rem',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6C63FF', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order Number
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#A5B4FC', fontFamily: 'monospace' }}>
              {order.orderNumber}
            </div>
            {order.total && (
              <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem' }}>
                Total: <strong style={{ color: '#F1F5F9' }}>€{order.total?.toFixed(2)}</strong>
                {' · '}
                {order.paymentMethod === 'stripe' ? '💳 Paid by card' : '💵 Cash on delivery'}
              </div>
            )}
          </div>
        )}

        {/* Next steps */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h4 style={{ color: '#94A3B8', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What happens next?
          </h4>
          {[
            { icon: '📧', text: 'Confirmation email sent to your inbox' },
            { icon: '⚡', text: 'Digital products: download link in email' },
            { icon: '📦', text: 'Physical products: shipped within 1-2 days' },
            { icon: '🔍', text: 'Track your order with your order number' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.875rem', color: '#64748B',
            }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/track" className="btn btn-primary" style={{ flex: 1 }}>
            🔍 Track Order
          </Link>
          <Link to="/shop" className="btn btn-outline" style={{ flex: 1 }}>
            Continue Shopping
          </Link>
        </div>

        {order && (
          <button
            onClick={() => generateInvoice(order)}
            style={{
              marginTop: '1rem', width: '100%',
              padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(16,185,129,0.08)', color: '#10B981',
              border: '1px solid rgba(16,185,129,0.25)',
              fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
          >
            📄 Download Invoice (PDF)
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderConfirm;