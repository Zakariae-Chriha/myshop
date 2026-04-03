import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../api/config';
import useSEO from '../../hooks/useSEO';

const StarInput = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '0.25rem' }}>
    {[1,2,3,4,5].map(star => (
      <span key={star} onClick={() => onChange(star)} style={{
        fontSize: '1.5rem', cursor: 'pointer',
        color: star <= value ? '#F59E0B' : '#1E293B',
        transition: 'color 0.15s',
      }}>★</span>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const { t, i18n }   = useTranslation();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [quantity,   setQuantity]   = useState(1);
  const [added,      setAdded]      = useState(false);
  const [tab,        setTab]        = useState('description');
  const [wishlisted, setWishlisted] = useState(false);

  const [reviews,      setReviews]      = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText,   setReviewText]   = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [zoomed,       setZoomed]       = useState(false);

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Pick the right language for product name/description
  const lang = i18n.language?.startsWith('ar') ? 'ar' : i18n.language?.startsWith('de') ? 'de' : 'en';

  useSEO({
    title:       product?.name?.[lang] || product?.name?.en || 'Product',
    description: product?.description?.[lang] || product?.description?.en || '',
    image:       product?.images?.[0],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`${BASE_URL}/api/reviews/${id}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []));

    if (user && token) {
      fetch(`${BASE_URL}/api/auth/wishlist`, { headers })
        .then(r => r.json())
        .then(d => {
          setWishlisted((d.wishlist || []).some(p => (p._id || p) === id));
        });
    }
  }, [id, user]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    toast.success(`${product.name?.en || 'Item'} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/wishlist/${id}`, { method: 'PUT', headers });
      const data = await res.json();
      setWishlisted(data.added);
      toast.success(data.added ? t('product.wishlist_add') : t('product.wishlist_remove'));
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST', headers,
        body: JSON.stringify({ product: id, rating: reviewRating, comment: reviewText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Review submitted — pending approval!');
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#F59E0B' : '#1E293B', fontSize: '1.1rem' }}>★</span>
    ));

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  );

  if (!product) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#475569' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>Product not found</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {t('common.back')}
        </button>
      </div>
    </div>
  );

  const name        = product.name?.[lang] || product.name?.en || product.name;
  const description = product.description?.[lang] || product.description?.en || product.description;
  const image       = product.images?.[0];
  const isDigital   = product.productType === 'digital';

  const gradients = [
    'linear-gradient(135deg, #1e1b4b, #312e81)',
    'linear-gradient(135deg, #064e3b, #065f46)',
    'linear-gradient(135deg, #4a1942, #6b21a8)',
    'linear-gradient(135deg, #1e3a5f, #1e40af)',
  ];
  const gradient = gradients[name.length % gradients.length];

  const tabLabels = {
    description: t('product.description'),
    details:     t('product.details'),
    reviews:     t('product.reviews'),
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
          <span onClick={() => navigate('/')} style={{ color: '#334155', cursor: 'pointer' }}>{t('nav.home')}</span>
          <span style={{ color: '#1E293B' }}>→</span>
          <span onClick={() => navigate('/shop')} style={{ color: '#334155', cursor: 'pointer' }}>{t('nav.shop')}</span>
          <span style={{ color: '#1E293B' }}>→</span>
          <span style={{ color: '#A5B4FC' }}>{name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Left — Image */}
          <div>
            {/* Lightbox overlay */}
            {zoomed && image && (
              <div onClick={() => setZoomed(false)} style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'zoom-out',
              }}>
                <img src={image} alt={name} style={{
                  maxWidth: '90vw', maxHeight: '90vh',
                  objectFit: 'contain', borderRadius: 12,
                  boxShadow: '0 0 80px rgba(108,99,255,0.3)',
                }} />
                <button onClick={() => setZoomed(false)} style={{
                  position: 'absolute', top: 20, right: 24,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            )}

            <div
              onClick={() => image && setZoomed(true)}
              style={{
                borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: image ? '#000' : gradient,
                height: 420,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: image ? 'zoom-in' : 'default',
              }}>
              {image
                ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                : <span style={{ fontSize: '8rem', opacity: 0.6 }}>{isDigital ? '💻' : '📦'}</span>
              }
              {image && (
                <div style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: 'rgba(0,0,0,0.55)', borderRadius: 8,
                  padding: '4px 10px', fontSize: '0.72rem', color: '#94A3B8',
                  backdropFilter: 'blur(4px)',
                }}>🔍 Click to zoom</div>
              )}
              <span className={`badge ${isDigital ? 'badge-digital' : 'badge-physical'}`}
                style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.8rem', padding: '5px 14px' }}>
                {isDigital ? `⚡ ${t('product.digital_product')}` : `📦 ${t('product.digital_product')}`}
              </span>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { icon: '🔒', text: t('home.secure_title') },
                { icon: '⚡', text: t('product.instant_delivery') },
                { icon: '🇩🇪', text: t('home.german_title') },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '0.75rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#334155' }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#6C63FF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              {product.category?.name?.en || 'Uncategorized'}
            </div>

            <h1 style={{ color: '#F1F5F9', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              {name}
            </h1>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>{renderStars(product.averageRating)}</div>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>{product.averageRating?.toFixed(1) || '0.0'}</span>
              <span style={{ color: '#334155', fontSize: '0.875rem' }}>({product.numReviews || 0} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div style={{
              background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>
                €{(product.priceWithVAT || product.price * 1.19).toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                <span>Net: €{product.price?.toFixed(2)}</span>
                <span>·</span>
                <span>{t('cart.vat')}: €{((product.priceWithVAT || product.price * 1.19) - product.price).toFixed(2)}</span>
              </div>
            </div>

            {/* Quantity + Add to cart + Wishlist */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {!isDigital && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F1F5F9', fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>−</button>
                  <span style={{ color: '#F1F5F9', fontWeight: 700, minWidth: 30, textAlign: 'center', fontSize: '1.1rem' }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F1F5F9', fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                </div>
              )}

              <button onClick={handleAddToCart} style={{
                flex: 1, padding: '0.9rem',
                background: added ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#6C63FF,#8B5CF6)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: added ? '0 4px 20px rgba(16,185,129,0.35)' : '0 4px 20px rgba(108,99,255,0.35)',
              }}>
                {added ? `✅ ${t('product.added')}` : `🛒 ${t('product.add_to_cart')}`}
              </button>

              <button onClick={toggleWishlist} title={wishlisted ? t('product.wishlist_remove') : t('product.wishlist_add')} style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: wishlisted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${wishlisted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: wishlisted ? '#FCA5A5' : '#475569',
                fontSize: '1.3rem', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {wishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Stock */}
            {!isDigital && (
              <div style={{
                fontSize: '0.85rem',
                color: product.stock > 10 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444',
                marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>{product.stock > 0 ? '✅' : '❌'}</span>
                <span>
                  {product.stock > 10
                    ? t('product.in_stock')
                    : product.stock > 0
                      ? t('product.only_left', { count: product.stock })
                      : t('product.out_of_stock')}
                </span>
              </div>
            )}

            {/* Tabs */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['description', 'details', 'reviews'].map(key => (
                  <button key={key} onClick={() => setTab(key)} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 8,
                    background: tab === key ? 'rgba(108,99,255,0.2)' : 'transparent',
                    color: tab === key ? '#A5B4FC' : '#334155',
                    border: tab === key ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  }}>
                    {tabLabels[key]}{key === 'reviews' ? ` (${reviews.length})` : ''}
                  </button>
                ))}
              </div>

              {tab === 'description' && (
                <p style={{ color: '#64748B', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {description || 'No description available for this product.'}
                </p>
              )}

              {tab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: t('product.details'), value: isDigital ? `⚡ ${t('product.digital_product')}` : `📦 ${t('product.digital_product')}` },
                    { label: 'Category',           value: product.category?.name?.en || 'Uncategorized' },
                    { label: t('product.instant_delivery'), value: isDigital ? t('product.instant_delivery') : 'Shipped to your address' },
                    { label: t('cart.vat'),        value: '19% included in price' },
                    { label: 'Sold',               value: `${product.totalSold || 0} times` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: '#334155' }}>{label}</span>
                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'reviews' && (
                <div>
                  {reviews.length === 0 ? (
                    <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      {t('product.no_reviews')}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {reviews.map(r => (
                        <div key={r._id} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 10, padding: '0.875rem',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: '#94A3B8', fontSize: '0.875rem' }}>{r.user?.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#334155' }}>
                              {new Date(r.createdAt).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          <div style={{ marginBottom: '0.35rem' }}>{renderStars(r.rating)}</div>
                          {r.comment && <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {user ? (
                    <form onSubmit={submitReview} style={{
                      background: 'rgba(108,99,255,0.06)',
                      border: '1px solid rgba(108,99,255,0.15)',
                      borderRadius: 12, padding: '1.25rem',
                    }}>
                      <h4 style={{ color: '#A5B4FC', marginBottom: '1rem', fontSize: '0.95rem' }}>{t('product.write_review')}</h4>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>{t('product.your_rating')}</label>
                        <StarInput value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('product.comment')}</label>
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          className="form-input" rows={3}
                          placeholder="Share your experience..."
                          maxLength={500}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                        {submitting ? t('product.submitting') : t('product.submit_review')}
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>
                      <span onClick={() => navigate('/login')} style={{ color: '#A5B4FC', cursor: 'pointer', textDecoration: 'underline' }}>
                        {t('product.login_to_review')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
