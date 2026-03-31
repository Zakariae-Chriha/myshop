import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { path: '/admin',            icon: '📊', label: 'Dashboard' },
    { path: '/admin/orders',     icon: '📦', label: 'Orders' },
    { path: '/admin/products',   icon: '🛍️', label: 'Products' },
    { path: '/admin/customers',  icon: '👥', label: 'Customers' },
    { path: '/admin/coupons',    icon: '🎟️', label: 'Coupons' },
    { path: '/admin/categories', icon: '🗂️', label: 'Categories' },
    { path: '/admin/admins',     icon: '👑', label: 'Admins' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A14' }}>

      {/* Sidebar */}
      <div style={{
        width: 250, background: '#080812',
        borderRight: '1px solid rgba(108,99,255,0.15)',
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontSize: '1.2rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>
            DigitalShop
          </div>
          <div style={{
            fontSize: '0.72rem', color: '#334155',
            fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Admin Panel
          </div>
        </div>

        {/* Admin info */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#334155' }}>Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1.5rem',
              fontSize: '0.875rem', fontWeight: 500,
              color:      isActive(item.path) ? '#fff' : '#475569',
              background: isActive(item.path) ? 'rgba(108,99,255,0.15)' : 'transparent',
              borderLeft: isActive(item.path) ? '3px solid #6C63FF' : '3px solid transparent',
              transition: 'all 0.2s', textDecoration: 'none',
              borderRadius: '0 8px 8px 0', marginRight: '0.75rem',
            }}
              onMouseEnter={e => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.color      = '#94A3B8';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.color      = '#475569';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.path === '/admin/orders' && (
                <span style={{
                  marginLeft: 'auto', background: 'rgba(108,99,255,0.2)',
                  color: '#A5B4FC', fontSize: '0.65rem', fontWeight: 700,
                  padding: '1px 7px', borderRadius: 20,
                }}>
                  New
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#334155', fontSize: '0.8rem', textDecoration: 'none',
            padding: '0.5rem 0', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}
          >
            <span>🏪</span> View Shop
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#334155', fontSize: '0.8rem',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 0', transition: 'color 0.2s', textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#FCA5A5'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#0A0A14' }}>

        {/* Top bar */}
        <div style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)',
          position: 'sticky', top: 0, zIndex: 10,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '0.875rem', color: '#334155' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px rgba(16,185,129,0.6)',
            }} />
            <span style={{ fontSize: '0.8rem', color: '#475569' }}>All systems online</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;