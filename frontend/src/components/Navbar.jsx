import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #F3F4F6',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64,
      }}>

        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.4rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          DigitalShop
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {[
            { path: '/',     label: 'Home' },
            { path: '/shop', label: 'Shop' },
            { path: '/track', label: 'Track Order' },
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              fontSize: '0.9rem', fontWeight: 500,
              color: isActive(path) ? '#6C63FF' : '#374151',
              borderBottom: isActive(path) ? '2px solid #6C63FF' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}

          {user && (
            <Link to="/account" style={{
              fontSize: '0.9rem', fontWeight: 500,
              color: isActive('/account') ? '#6C63FF' : '#374151',
            }}>
              My Account
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" style={{
              fontSize: '0.9rem', fontWeight: 600, color: '#FF6584',
            }}>
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Cart button */}
          <Link to="/cart" style={{
            position: 'relative', display: 'flex',
            alignItems: 'center', gap: '0.4rem',
            background: '#EEF0FF', color: '#6C63FF',
            padding: '0.5rem 1rem', borderRadius: 8,
            fontWeight: 600, fontSize: '0.9rem',
          }}>
            🛒 Cart
            {totalItems > 0 && (
              <span style={{
                background: '#FF6584', color: '#fff',
                borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth buttons */}
          {user ? (
            <button onClick={logout} style={{
              background: 'transparent', color: '#6B7280',
              border: '1.5px solid #D1D5DB', padding: '0.5rem 1rem',
              borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer',
            }}>
              Logout
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" style={{
                padding: '0.5rem 1rem', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 500,
                color: '#374151', border: '1.5px solid #D1D5DB',
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                padding: '0.5rem 1rem', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 600,
                background: '#6C63FF', color: '#fff',
              }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;