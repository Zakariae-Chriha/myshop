import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart } = useCart();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added,    setAdded]    = useState(false);
  const [tab,      setTab]      = useState('description');

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#F59E0B' : '#1E293B', fontSize: '1.1rem' }}>★</span>
    ));
  };

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
          Back to Shop
        </button>
      </div>
    </div>
  );

  const name        = product.name?.en || product.name;
  const description = product.description?.en || product.description;
  const image       = product.images?.[0];
  const isDigital   = product.productType === 'digital';

  const gradients = [
    'linear-gradient(135deg, #1e1b4b, #312e81)',
    'linear-gradient(135deg, #064e3b, #065f46)',
    'linear-gradient(135deg, #4a1942, #6b21a8)',
    'linear-gradient(135deg, #1e3a5f, #1e40af)',
  ];
  const gradient = gradients[name.length % gradients.length];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
          <span onClick={() => navigate('/')} style={{ color: '#334155', cursor: 'pointer' }}>Home</span>
          <span style={{ color: '#1E293B' }}>→</span>
          <span onClick={() => navigate('/shop')} style={{ color: '#334155', cursor: 'pointer' }}>Shop</span>
          <span style={{ color: '#1E293B' }}>→</span>
          <span style={{ color: '#A5B4FC' }}>{name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Left — Image */}
          <div>
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: image ? '#000' : gradient,
              height: 420,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {image ? (
                <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '8rem', opacity: 0.6 }}>
                  {isDigital ? '💻' : '📦'}
                </span>
              )}

              {/* Badge */}
              <span className={`badge ${isDigital ? 'badge-digital' : 'badge-physical'}`}
                style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.8rem', padding: '5px 14px' }}>
                {isDigital ? '⚡ Digital Product' : '📦 Physical Product'}
              </span>
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem', marginTop: '1rem',
            }}>
              {[
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '⚡', text: 'Instant Access' },
                { icon: '🇩🇪', text: 'GDPR Compliant' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '0.75rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#334155' }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Details */}
          <div>
            {/* Category */}
            <div style={{ fontSize: '0.78rem', color: '#6C63FF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              {product.category?.name?.en || 'Uncategorized'}
            </div>

            {/* Title */}
            <h1 style={{ color: '#F1F5F9', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              {name}
            </h1>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>{renderStars(product.averageRating)}</div>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>{product.averageRating?.toFixed(1) || '0.0'}</span>
              <span style={{ color: '#334155', fontSize: '0.875rem' }}>({product.numReviews || 0} reviews)</span>
            </div>

            {/* Price */}
            <div style={{
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 16, padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>
                €{(product.priceWithVAT || product.price * 1.19).toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                <span>Net: €{product.price?.toFixed(2)}</span>
                <span>·</span>
                <span>VAT (19%): €{((product.priceWithVAT || product.price * 1.19) - product.price).toFixed(2)}</span>
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              {!isDigital && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F1F5F9', fontSize: '1.2rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>−</button>
                  <span style={{ color: '#F1F5F9', fontWeight: 700, minWidth: 30, textAlign: 'center', fontSize: '1.1rem' }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F1F5F9', fontSize: '1.2rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                </div>
              )}

              <button onClick={handleAddToCart} style={{
                flex: 1, padding: '0.9rem',
                background: added
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: added
                  ? '0 4px 20px rgba(16,185,129,0.35)'
                  : '0 4px 20px rgba(108,99,255,0.35)',
              }}>
                {added ? '✅ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>

            {/* Stock */}
            {!isDigital && (
              <div style={{
                fontSize: '0.85rem', color: product.stock > 10 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444',
                marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>{product.stock > 0 ? '✅' : '❌'}</span>
                <span>{product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}</span>
              </div>
            )}

            {/* Tabs */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['description', 'details'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 8,
                    background: tab === t ? 'rgba(108,99,255,0.2)' : 'transparent',
                    color: tab === t ? '#A5B4FC' : '#334155',
                    border: tab === t ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}>
                    {t}
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
                    { label: 'Type',     value: isDigital ? '⚡ Digital Download' : '📦 Physical Product' },
                    { label: 'Category', value: product.category?.name?.en || 'Uncategorized' },
                    { label: 'Format',   value: isDigital ? 'Instant Download' : 'Shipped to your address' },
                    { label: 'VAT',      value: '19% included in price' },
                    { label: 'Sold',     value: `${product.totalSold || 0} times` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '0.875rem',
                    }}>
                      <span style={{ color: '#334155' }}>{label}</span>
                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
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