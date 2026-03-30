import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (searchParams.get('order')) {
      handleTrack(null, searchParams.get('order'));
    }
  }, []);

  const handleTrack = async (e, num) => {
    if (e) e.preventDefault();
    const trackNum = num || orderNumber;
    if (!trackNum.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res  = await fetch(`http://localhost:5000/api/orders/track/${trackNum.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? statusSteps.indexOf(order.orderStatus) : -1;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 640 }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h1 style={{ marginBottom: '0.5rem' }}>Track Your Order</h1>
          <p style={{ color: '#6B7280' }}>Enter your order number to see real-time status</p>
        </div>

        {/* Search */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '1.5rem',
          marginBottom: '1.5rem', border: '1px solid #F3F4F6',
        }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="e.g. ORD-1001"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              className="form-input"
              style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.05em' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 100 }}>
              {loading ? '...' : 'Track'}
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Result */}
        {order && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '1.5rem',
            border: '1px solid #F3F4F6',
          }}>

            {/* Order info */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: 2 }}>Order Number</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#6C63FF', fontFamily: 'monospace' }}>
                  {order.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: 2 }}>Order Date</div>
                <div style={{ fontWeight: 500 }}>
                  {new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                {/* Background line */}
                <div style={{
                  position: 'absolute', top: 16, left: '6%', right: '6%',
                  height: 3, background: '#E5E7EB', borderRadius: 2, zIndex: 0,
                }} />
                {/* Progress line */}
                <div style={{
                  position: 'absolute', top: 16, left: '6%',
                  height: 3, borderRadius: 2, zIndex: 1,
                  background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
                  width: currentStep <= 0 ? '0%' : `${(currentStep / (statusSteps.length - 1)) * 88}%`,
                  transition: 'width 0.8s ease',
                }} />

                {statusSteps.map((step, i) => (
                  <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: i <= currentStep
                        ? 'linear-gradient(135deg, #6C63FF, #FF6584)'
                        : '#E5E7EB',
                      border: '3px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.5rem',
                      boxShadow: i <= currentStep ? '0 2px 8px rgba(108,99,255,0.4)' : 'none',
                      color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                      transition: 'all 0.3s',
                    }}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: i === currentStep ? 700 : 400,
                      color: i <= currentStep ? '#6C63FF' : '#9CA3AF',
                      textTransform: 'capitalize',
                    }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div style={{
                background: 'linear-gradient(135deg, #EEF0FF, #E8E6FF)',
                borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem',
                border: '1px solid #C7D2FE',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                  Tracking Number
                </div>
                <div style={{ fontWeight: 800, color: '#6C63FF', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  {order.trackingNumber}
                </div>
                {order.trackingCarrier && (
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    Carrier: {order.trackingCarrier}
                  </div>
                )}
                {order.shippedAt && (
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    Shipped: {new Date(order.shippedAt).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              <h4 style={{ marginBottom: '0.75rem', color: '#374151' }}>Items in this order</h4>
              {order.items?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid #F3F4F6',
                  fontSize: '0.875rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: item.productType === 'digital' ? '#EEF0FF' : '#D1FAE5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {item.productType === 'digital' ? '💻' : '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#6C63FF' }}>
                    €{(item.priceWithVAT * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;