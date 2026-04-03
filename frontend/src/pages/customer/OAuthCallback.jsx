import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../api/config';

const OAuthCallback = () => {
  const [params]   = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login?error=oauth'); return; }

    // Fetch user profile with the token
    fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          loginWithToken(data.user, token);
          navigate('/');
        } else {
          navigate('/login?error=oauth');
        }
      })
      .catch(() => navigate('/login?error=oauth'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: '#A5B4FC' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p>Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
