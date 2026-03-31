import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate  = useNavigate();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${search.trim()}`);
      setSearch('');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,10,20,0.95)' : 'rgba(10,10,20,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(108,99,255,0.15)',
        transition: 'all 0.3s',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 68, gap: '1rem',
        }}>

          {/* Logo */}
          <Link to="/" style={{
            fontSize: '1.35rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px', flexShrink: 0,
          }}>
            DigitalShop
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            className="desktop-nav">
            {[
              { path: '/',     label: 'Home' },
              { path: '/shop', label: 'Shop' },
              { path: '/track', label: 'Track Order' },
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive(path) ? '#fff' : '#94A3B8',
                background: isActive(path) ? 'rgba(108,99,255,0.15)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 260 }}
            className="desktop-search">
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: '#475569', fontSize: '14px',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, color: '#F1F5F9',
                  fontSize: '0.85rem', transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(108,99,255,0.5)';
                  e.target.style.background   = 'rgba(108,99,255,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background   = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>
          </form>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>

            {/* Cart */}
            <Link to="/cart" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              color: '#A5B4FC', padding: '0.5rem 1rem',
              borderRadius: 20, fontWeight: 600, fontSize: '0.875rem',
              transition: 'all 0.2s',
            }}>
              🛒
              {totalItems > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  color: '#fff', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isAdmin && (
                  <Link to="/admin" style={{
                    padding: '0.5rem 0.875rem', borderRadius: 8,
                    background: 'rgba(255,101,132,0.15)',
                    color: '#FF6584', fontSize: '0.8rem', fontWeight: 600,
                    border: '1px solid rgba(255,101,132,0.3)',
                  }}>
                    Admin
                  </Link>
                )}
                <Link to="/account" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={logout} style={{
                  background: 'transparent', color: '#475569',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.5rem 0.875rem', borderRadius: 8,
                  fontSize: '0.8rem', cursor: 'pointer',
                }}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" style={{
                  padding: '0.5rem 1rem', borderRadius: 8,
                  color: '#94A3B8', fontSize: '0.875rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8', padding: '0.5rem',
                borderRadius: 8, cursor: 'pointer',
                display: 'none',
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(10,10,20,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '1rem 1.5rem',
          }}>
            <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.875rem' }}
              />
            </form>
            {[
              { path: '/',      label: 'Home' },
              { path: '/shop',  label: 'Shop' },
              { path: '/track', label: 'Track Order' },
              ...(user ? [{ path: '/account', label: 'My Account' }] : []),
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                display: 'block', padding: '0.75rem 0',
                color: isActive(path) ? '#A5B4FC' : '#94A3B8',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.9rem',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;