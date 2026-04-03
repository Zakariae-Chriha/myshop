import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BASE_URL from '../../api/config';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const TrackOrder = () => {
  const { t } = useTranslation();
  const [searchParams]  = useSearchParams();
  const [orderNumber,   setOrderNumber]   = useState(searchParams.get('order') || '');
  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    if (searchParams.get('order')) handleTrack(null, searchParams.get('order'));
  }, []);

  const handleTrack = async (e, num) => {
    if (e) e.preventDefault();
    const trackNum = num || orderNumber;
    if (!trackNum.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res  = await fetch(`${BASE_URL}/api/orders/track/${trackNum.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err.message || t('track.not_found'));
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? statusSteps.indexOf(order.orderStatus) : -1;
  const stepIcons   = { pending: '⏳', processing: '⚙️', shipped: '🚚', delivered: '✅' };
  const stepLabels  = {
    pending:    t('track.placed'),
    processing: t('track.processing'),
    shipped:    t('track.shipped'),
    delivered:  t('track.delivered'),
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 680 }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.2))',
            border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            🔍
          </div>
          <h1 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>{t('track.title')}</h1>
          <p style={{ color: '#475569' }}>{t('track.desc')}</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '1.75rem',
          marginBottom: '1.5rem',
        }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: '#334155', fontSize: '14px',
              }}>
                📋
              </span>
              <input
                type="text"
                placeholder={t('track.placeholder')}
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.05em' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: 120 }}>
              {loading ? `⏳ ${t('track.tracking')}` : `🔍 ${t('track.button')}`}
            </button>
          </form>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ❌ {error}
          </div>
        )}

        {order && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '2rem',
            animation: 'fadeInUp 0.4s ease',
          }}>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('track.status')}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#A5B4FC', fontFamily: 'monospace' }}>
                  {order.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order Date
                </div>
                <div style={{ fontWeight: 600, color: '#94A3B8' }}>
                  {new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{
                  position: 'absolute', top: 20, left: '8%', right: '8%',
                  height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, zIndex: 0,
                }} />
                <div style={{
                  position: 'absolute', top: 20, left: '8%',
                  height: 3, borderRadius: 2, zIndex: 1,
                  background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
                  width: currentStep <= 0 ? '0%' : `${(currentStep / (statusSteps.length - 1)) * 84}%`,
                  transition: 'width 1s ease',
                }} />

                {statusSteps.map((step, i) => (
                  <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', margin: '0 auto 0.75rem',
                      background: i <= currentStep
                        ? 'linear-gradient(135deg, #6C63FF, #FF6584)'
                        : 'rgba(255,255,255,0.05)',
                      border: i <= currentStep
                        ? '2px solid rgba(108,99,255,0.5)'
                        : '2px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem',
                      boxShadow: i <= currentStep ? '0 4px 16px rgba(108,99,255,0.3)' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {i < currentStep ? '✓' : stepIcons[step]}
                    </div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: i === currentStep ? 700 : 400,
                      color: i <= currentStep ? '#A5B4FC' : '#334155',
                    }}>
                      {stepLabels[step]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.trackingNumber && (
              <div style={{
                background: 'rgba(108,99,255,0.08)',
                border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: 14, padding: '1.25rem',
                marginBottom: '1.75rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tracking Number
                </div>
                <div style={{ fontWeight: 800, color: '#A5B4FC', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                  {order.trackingNumber}
                </div>
                {order.trackingCarrier && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.35rem' }}>
                    Carrier: {order.trackingCarrier}
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 style={{ color: '#94A3B8', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Items in this order
              </h4>
              {order.items?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '0.875rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: item.productType === 'digital'
                        ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
                        : 'linear-gradient(135deg, #064e3b, #065f46)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {item.productType === 'digital' ? '💻' : '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#F1F5F9' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#334155' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#A5B4FC' }}>
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
