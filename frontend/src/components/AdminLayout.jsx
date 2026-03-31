import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/categories', icon: '🗂️', label: 'Categories' },
    { path: '/admin',            icon: '📊', label: 'Dashboard' },
    { path: '/admin/orders',     icon: '📦', label: 'Orders' },
    { path: '/admin/products',   icon: '🛍️', label: 'Products' },
    { path: '/admin/customers',  icon: '👥', label: 'Customers' },
    { path: '/admin/coupons',    icon: '🎟️', label: 'Coupons' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>

      {/* Sidebar */}
      <div style={{
        width: 240, background: '#1A1A2E', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            DigitalShop
          </div>
          <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: 2 }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 500,
              color:      isActive(item.path) ? '#fff' : '#64748B',
              background: isActive(item.path) ? 'rgba(108,99,255,0.2)' : 'transparent',
              borderLeft: isActive(item.path) ? '3px solid #6C63FF' : '3px solid transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#64748B', fontSize: '0.875rem', marginBottom: '0.75rem',
            textDecoration: 'none',
          }}>
            🏪 View Shop
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#64748B', fontSize: '0.875rem', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;