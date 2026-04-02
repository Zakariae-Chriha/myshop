import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import BASE_URL from '../../api/config';
import useSEO from '../../hooks/useSEO';

const Wishlist = () => {
  useSEO({ title: 'My Wishlist', description: 'Your saved products on DigitalShop' });

  const { user }    = useAuth();
  const { addToCart } = useCart();
  const navigate    = useNavigate();
  const [wishlist,  setWishlist]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [removing,  setRemoving]  = useState(null);

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch(`${BASE_URL}/api/auth/wishlist`, { headers })
      .then(r => r.json())
      .then(d => setWishlist(d.wishlist || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const removeFromWishlist = async (productId) => {
    setRemoving(productId);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/wishlist/${productId}`, { method: 'PUT', headers });
      const data = await res.json();
      setWishlist(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name?.en || product.name} added to cart!`);
  };

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#F1F5F9', marginBottom: '0.25rem' }}>My Wishlist</h1>
          <p style={{ color: '#475569' }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love by clicking the heart icon</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map(product => {
              const name    = product.name?.en || product.name;
              const image   = product.images?.[0];
              const price   = product.priceWithVAT || product.price * 1.19;

              return (
                <div key={product._id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, overflow: 'hidden',
                  transition: 'all 0.3s',
                }}>
                  {/* Image */}
                  <Link to={`/product/${product._id}`}>
                    <div style={{
                      height: 200, background: image ? '#000' : 'linear-gradient(135deg,#1e1b4b,#312e81)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}>
                      {image
                        ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '4rem', opacity: 0.5 }}>{product.productType === 'digital' ? '💻' : '📦'}</span>
                      }
                    </div>
                  </Link>

                  <div style={{ padding: '1rem' }}>
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ color: '#F1F5F9', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{name}</h4>
                    </Link>
                    <div style={{ color: '#A5B4FC', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                      €{price.toFixed(2)}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => moveToCart(product)}
                        className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        🛒 Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        disabled={removing === product._id}
                        style={{
                          padding: '0.45rem 0.75rem', borderRadius: 8, fontSize: '0.82rem',
                          background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                          border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                        }}>
                        {removing === product._id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
