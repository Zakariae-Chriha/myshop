import { useLocation, Link } from 'react-router-dom';

const OrderConfirm = () => {
  const location = useLocation();
  const order    = location.state?.order;

  return (
    <div style={{
      background: '#F9FAFB', minHeight: '80vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '3rem 2.5rem',
        maxWidth: 520, width: '100%', textAlign: 'center',
        border: '1px solid #F3F4F6',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 1.5rem', color: '#fff',
          fontWeight: 800,
        }}>
          ✓
        </div>

        <h1 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          Thank you for your purchase! You will receive a confirmation email shortly.
        </p>

        {order && (
          <div style={{
            background: '#EEF0FF', borderRadius: 12,
            padding: '1.25rem', marginBottom: '2rem',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: 4 }}>
              Order Number
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6C63FF' }}>
              {order.orderNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: 4 }}>
              Total: €{order.total?.toFixed(2)} · {order.paymentMethod === 'stripe' ? 'Paid by card' : 'Cash on delivery'}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.75rem', color: '#374151' }}>What happens next?</h4>
          {[
            { icon: '📧', text: 'You will receive a confirmation email' },
            { icon: '⚡', text: 'Digital products: download link sent by email' },
            { icon: '📦', text: 'Physical products: shipped within 1-2 business days' },
            { icon: '🔍', text: 'Track your order with your order number' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', gap: '0.75rem',
              marginBottom: '0.6rem', fontSize: '0.875rem', color: '#374151',
            }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/track" className="btn btn-primary" style={{ flex: 1 }}>
            Track Order
          </Link>
          <Link to="/shop" className="btn btn-outline" style={{ flex: 1 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirm;