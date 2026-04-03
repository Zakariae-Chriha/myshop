import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../api/config';

const ProductCard = ({ product }) => {
  const { addToCart }   = useCart();
  const { user }        = useAuth();
  const { t, i18n }     = useTranslation();
  const [wishlisted, setWishlisted] = useState(false);
  const [wLoading,   setWLoading]   = useState(false);

  const lang      = i18n.language?.startsWith('ar') ? 'ar' : i18n.language?.startsWith('de') ? 'de' : 'en';
  const name      = product.name?.[lang] || product.name?.en || product.name || 'Product';
  const image     = product.images?.[0];
  const isDigital = product.productType === 'digital';

  const gradients = [
    'linear-gradient(135deg, #1e1b4b, #312e81)',
    'linear-gradient(135deg, #064e3b, #065f46)',
    'linear-gradient(135deg, #4a1942, #6b21a8)',
    'linear-gradient(135deg, #1e3a5f, #1e40af)',
    'linear-gradient(135deg, #3d1515, #7f1d1d)',
    'linear-gradient(135deg, #1a2e1a, #14532d)',
  ];
  const gradientIndex = name.length % gradients.length;

  // Wishlist state is local — toggled by the heart button only

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${name} ${t('product.add_to_cart') || 'added to cart'}!`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    setWLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/wishlist/${product._id}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setWishlisted(data.added);
      toast.success(data.added ? '❤️ Saved to wishlist' : '💔 Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWLoading(false);
    }
  };

  const renderStars = (rating = 0) => {
    const full  = Math.round(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        height: '100%', display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform  = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)';
          e.currentTarget.style.boxShadow  = '0 16px 48px rgba(108,99,255,0.15)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform  = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow  = 'none';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        {/* Image */}
        <div style={{
          height: 200, position: 'relative', overflow: 'hidden',
          background: image ? '#000' : gradients[gradientIndex],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {image ? (
            <img src={image} alt={name} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }} />
          ) : (
            <span style={{ fontSize: '3.5rem', opacity: 0.8 }}>
              {isDigital ? '💻' : '📦'}
            </span>
          )}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }} />

          {/* Badge */}
          <span className={`badge ${isDigital ? 'badge-digital' : 'badge-physical'}`}
            style={{ position: 'absolute', top: 12, left: 12 }}>
            {isDigital ? `⚡ ${t('shop.digital')}` : `📦 ${t('shop.physical')}`}
          </span>

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            disabled={wLoading}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: wishlisted ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.5)',
              border: wishlisted ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.15)',
              color: wishlisted ? '#fff' : '#94A3B8',
              fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', backdropFilter: 'blur(4px)',
            }}
          >
            {wishlisted ? '❤' : '♡'}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: '0.7rem', color: '#6C63FF',
            fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: '0.35rem',
          }}>
            {product.category?.name?.en || 'Uncategorized'}
          </div>

          <h4 style={{
            fontSize: '0.95rem', fontWeight: 600, color: '#F1F5F9',
            marginBottom: '0.4rem', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {name}
          </h4>

          {/* Stars */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="stars" style={{ fontSize: '12px' }}>
              {renderStars(product.averageRating)}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#475569', marginLeft: 4 }}>
              ({product.numReviews || 0})
            </span>
          </div>

          {/* Price + Button */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginTop: 'auto',
          }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                €{(product.priceWithVAT || product.price * 1.19).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#475569' }}>
                incl. 19% VAT
              </div>
            </div>

            <button onClick={handleAdd}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}>
              {t('product.add_to_cart') || '+ Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
