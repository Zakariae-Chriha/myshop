import { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookieConsent');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1A1A2E', borderTop: '1px solid rgba(108,99,255,0.3)',
      padding: '1.25rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '1rem',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🍪</span>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
            We use cookies
          </span>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.5 }}>
          We use cookies to improve your experience, analyze traffic and personalize content.
          By clicking "Accept", you agree to our{' '}
          <a href="/datenschutz" style={{ color: '#6C63FF', textDecoration: 'underline' }}>
            Privacy Policy
          </a>.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '0.6rem 1.25rem', borderRadius: 8,
          background: 'transparent', color: '#94A3B8',
          border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          padding: '0.6rem 1.5rem', borderRadius: 8,
          background: '#6C63FF', color: '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(108,99,255,0.4)',
        }}>
          Accept All
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;