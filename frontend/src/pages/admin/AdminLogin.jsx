import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(formData.email, formData.password);
      if (data.user.role !== 'admin') {
        setError('Access denied — admin accounts only');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(108,99,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,101,132,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 70, height: 70, borderRadius: 20, marginBottom: '1rem',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            boxShadow: '0 8px 32px rgba(108,99,255,0.3)',
            fontSize: '2rem',
          }}>
            ⚙️
          </div>
          <div style={{
            fontSize: '1.75rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>
            DigitalShop
          </div>
          <div style={{ color: '#334155', fontSize: '0.875rem' }}>
            Admin Control Panel
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}>

          <h2 style={{
            color: '#F1F5F9', fontSize: '1.25rem',
            fontWeight: 700, marginBottom: '0.35rem',
          }}>
            Welcome back 👋
          </h2>
          <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Sign in to manage your shop
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '0.75rem 1rem',
              color: '#FCA5A5', fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: '14px', color: '#334155',
                }}>
                  📧
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="admin@myshop.com"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', fontSize: '14px', color: '#334155',
                }}>
                  🔐
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="Your password"
                  style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#334155', cursor: 'pointer', fontSize: '14px',
                    padding: '4px',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                <a href="/forgot-password" style={{
                  fontSize: '0.8rem', color: '#6C63FF',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => e.target.style.color = '#A5B4FC'}
                  onMouseLeave={e => e.target.style.color = '#6C63FF'}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.9rem',
                background: loading
                  ? 'rgba(108,99,255,0.5)'
                  : 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(108,99,255,0.35)',
                marginTop: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform  = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow  = '0 8px 28px rgba(108,99,255,0.45)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.35)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                <>⚡ Sign In to Admin Panel</>
              )}
            </button>
          </form>

          {/* Back to shop */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{
              fontSize: '0.8rem', color: '#334155',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#64748B'}
              onMouseLeave={e => e.target.style.color = '#334155'}
            >
              ← Back to Shop
            </a>
          </div>
        </div>

        {/* Security badge */}
        <div style={{
          textAlign: 'center', marginTop: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '12px' }}>🔒</span>
          <span style={{ fontSize: '0.75rem', color: '#1e293b' }}>
            Secured with SSL encryption · Admin access only
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;