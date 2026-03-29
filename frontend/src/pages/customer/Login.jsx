import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate           = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,   setError]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      // Redirect admin to admin panel, customer to home
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{
        background: '#fff', padding: '2.5rem',
        borderRadius: 12, width: '100%', maxWidth: 420,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>
          Welcome Back
        </h2>

        {error && (
          <div style={{
            background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem',
            borderRadius: 8, marginBottom: '1rem', fontSize: '14px',
            border: '1px solid #fecaca',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={btnStyle}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1a1a1a', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1px solid #ddd', borderRadius: 8,
  fontSize: '15px', outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle = {
  width: '100%', padding: '0.85rem',
  background: '#1a1a1a', color: '#fff',
  border: 'none', borderRadius: 8,
  fontSize: '15px', fontWeight: 600,
  cursor: 'pointer',
};

export default Login;