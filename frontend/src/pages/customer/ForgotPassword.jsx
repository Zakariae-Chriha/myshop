import { useState } from 'react';
import { Link } from 'react-router-dom';
import BASE_URL from '../../api/config';

const ForgotPassword = () => {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '2.5rem',
        width: '100%', maxWidth: 420,
      }}>
        {!sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
              <h2 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>Forgot Password?</h2>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>
                Enter your email and we will send you a reset link
              </p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.5rem' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#475569' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#A5B4FC' }}>Login here</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ color: '#F1F5F9', marginBottom: '0.75rem' }}>Check Your Email!</h2>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              We sent a password reset link to <strong style={{ color: '#A5B4FC' }}>{email}</strong>.
              The link expires in 1 hour.
            </p>
            <Link to="/login" className="btn btn-outline btn-full">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;