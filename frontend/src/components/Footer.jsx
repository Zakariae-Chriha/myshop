import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#050510',
      borderTop: '1px solid rgba(108,99,255,0.15)',
      padding: '4rem 0 2rem',
      marginTop: 0,
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem', marginBottom: '3rem',
        }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img
                src="/logo.png"
                alt="ZC Brands"
                style={{ height: 50, width: 'auto', objectFit: 'contain', mixBlendMode: 'screen' }}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
              Selected German Quality — premium digital and physical products for professionals worldwide.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['🐦', '📘', '📸', '💼'].map((icon, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: '#F1F5F9', marginBottom: '1rem', fontSize: '0.9rem' }}>Shop</h4>
            {[
              { to: '/shop',              label: 'All Products' },
              { to: '/shop?type=digital', label: 'Digital Products' },
              { to: '/shop?type=physical', label: 'Physical Products' },
              { to: '/track',             label: 'Track Order' },
            ].map(({ to, label }) => (
              <div key={to} style={{ marginBottom: '0.6rem' }}>
                <Link to={to} style={{
                  fontSize: '0.875rem', color: '#475569',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = '#A5B4FC'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: '#F1F5F9', marginBottom: '1rem', fontSize: '0.9rem' }}>Account</h4>
            {[
              { to: '/login',    label: 'Login' },
              { to: '/register', label: 'Register' },
              { to: '/account',  label: 'My Account' },
              { to: '/account',  label: 'My Orders' },
            ].map(({ to, label }) => (
              <div key={label} style={{ marginBottom: '0.6rem' }}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#475569', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#A5B4FC'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: '#F1F5F9', marginBottom: '1rem', fontSize: '0.9rem' }}>Legal</h4>
            {[
              { to: '/impressum',   label: 'Impressum' },
              { to: '/datenschutz', label: 'Datenschutz' },
              { to: '/agb',         label: 'AGB' },
            ].map(({ to, label }) => (
              <div key={to} style={{ marginBottom: '0.6rem' }}>
                <Link to={to} style={{ fontSize: '0.875rem', color: '#475569', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#A5B4FC'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>
                  {label}
                </Link>
              </div>
            ))}

            {/* Trust badges */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { icon: '🔒', text: 'SSL Encrypted' },
                { icon: '🇩🇪', text: 'GDPR Compliant' },
                { icon: '💳', text: 'Secure Payments' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <p style={{ fontSize: '0.8rem', color: '#334155' }}>
            © {new Date().getFullYear()} ZC Brands — All rights reserved
          </p>
          <p style={{ fontSize: '0.8rem', color: '#334155' }}>
            🇩🇪 Alle Preise inkl. 19% MwSt. · Made in Germany
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;