import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', background: '#1a1a1a', color: '#fff',
      flexWrap: 'wrap', gap: '1rem',
    }}>
      <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
        MyShop
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/"     style={{ color: '#fff' }}>Home</Link>
        <Link to="/shop" style={{ color: '#fff' }}>Shop</Link>
        <Link to="/cart" style={{ color: '#fff' }}>
          Cart {totalItems > 0 && `(${totalItems})`}
        </Link>
        <Link to="/track" style={{ color: '#fff' }}>Track Order</Link>

        {user ? (
          <>
            <Link to="/account" style={{ color: '#fff' }}>My Account</Link>
            {isAdmin && (
              <Link to="/admin" style={{ color: '#f0a500' }}>Admin</Link>
            )}
            <button onClick={logout} style={{
              background: 'transparent', color: '#fff',
              border: '1px solid #fff', padding: '4px 12px',
              borderRadius: 4, cursor: 'pointer',
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    style={{ color: '#fff' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;