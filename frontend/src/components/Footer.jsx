import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#1A1A2E',
      color: '#94A3B8',
      padding: '3rem 0 1.5rem',
      marginTop: '0',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>

          {/* Brand */}
          <div>
            <div style={{
              fontSize: '1.3rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '0.75rem',
            }}>
              DigitalShop
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              Premium digital products — courses, ebooks, and templates for professionals.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '0.9rem' }}>Shop</h4>
            {[
              { to: '/shop',            label: 'All Products' },
              { to: '/shop?type=digital', label: 'Digital Products' },
              { to: '/track',           label: 'Track Order' },
            ].map(({ to, label }) => (
              <div key={to} style={{ marginBottom: '0.5rem' }}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#64748B', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#64748B'}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '0.9rem' }}>Account</h4>
            {[
              { to: '/login',    label: 'Login' },
              { to: '/register', label: 'Register' },
              { to: '/account',  label: 'My Account' },
            ].map(({ to, label }) => (
              <div key={to} style={{ marginBottom: '0.5rem' }}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#64748B' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#64748B'}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '0.9rem' }}>Legal</h4>
            {[
              { to: '/impressum',   label: 'Impressum' },
              { to: '/datenschutz', label: 'Datenschutz' },
              { to: '/agb',         label: 'AGB' },
            ].map(({ to, label }) => (
              <div key={to} style={{ marginBottom: '0.5rem' }}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#64748B' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#64748B'}>
                  {label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #1E293B',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <p style={{ fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} DigitalShop — All rights reserved
          </p>
          <p style={{ fontSize: '0.8rem' }}>
            🇩🇪 Made in Germany — Alle Preise inkl. 19% MwSt.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;