import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BASE_URL from '../../api/config';

const ConfirmDelivery = () => {
  const { token } = useParams();
  const [status,  setStatus]  = useState('loading'); // loading | success | already | error
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/api/orders/confirm-delivery/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.orderNumber) setOrderNumber(data.orderNumber);
        if (data.message === 'Already confirmed') {
          setStatus('already');
        } else if (data.message === 'Delivery confirmed') {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const wrap = {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem',
  };

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '3rem 2.5rem',
    maxWidth: 480, width: '100%', textAlign: 'center',
  };

  if (status === 'loading') {
    return (
      <div style={wrap}>
        <div style={card}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ color: '#64748B' }}>Confirming your delivery...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#34D399', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Delivery Confirmed!
          </h1>
          {orderNumber && (
            <p style={{ color: '#A5B4FC', fontFamily: 'monospace', fontSize: '1rem', marginBottom: '0.75rem' }}>
              Order {orderNumber}
            </p>
          )}
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Thank you for confirming receipt of your order. Your payment has been recorded.
          </p>
          <Link to="/" style={{
            display: 'inline-block', padding: '0.75rem 2rem', borderRadius: 10,
            background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
            color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
          }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h1 style={{ color: '#A5B4FC', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Already Confirmed
          </h1>
          {orderNumber && (
            <p style={{ color: '#64748B', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
              Order {orderNumber}
            </p>
          )}
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem' }}>
            This order was already marked as delivered. No action needed.
          </p>
          <Link to="/" style={{
            display: 'inline-block', padding: '0.75rem 2rem', borderRadius: 10,
            background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
            color: '#A5B4FC', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
          }}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h1 style={{ color: '#FCA5A5', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Invalid Link
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2rem' }}>
          This confirmation link is invalid or has already been used. Please contact support if you need help.
        </p>
        <Link to="/" style={{
          display: 'inline-block', padding: '0.75rem 2rem', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94A3B8', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
        }}>
          Back to Shop
        </Link>
      </div>
    </div>
  );
};

export default ConfirmDelivery;
