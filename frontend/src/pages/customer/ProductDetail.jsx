import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added,    setAdded]    = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg,  setReviewMsg]  = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${id}`),
          fetch(`http://localhost:5000/api/reviews/${id}`),
        ]);
        const pData = await pRes.json();
        const rData = await rRes.json();
        setProduct(pData.product);
        setReviews(rData.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ product: id, ...reviewForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg('Review submitted — pending approval');
        setReviewForm({ rating: 5, comment: '' });
      } else {
        setReviewMsg(data.message);
      }
    } catch {
      setReviewMsg('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (r = 0) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!product) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Shop</Link>
    </div>
  );

  const name        = product.name?.en || product.name;
  const description = product.description?.en || product.description;
  const isDigital   = product.productType === 'digital';

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '0.75rem 0' }}>
        <div className="container" style={{ fontSize: '0.875rem', color: '#6B7280' }}>
          <Link to="/" style={{ color: '#6B7280' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <Link to="/shop" style={{ color: '#6B7280' }}>Shop</Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ color: '#1F2937', fontWeight: 500 }}>{name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
        }}>

          {/* Left — Image */}
          <div>
            <div style={{
              background: isDigital
                ? 'linear-gradient(135deg, #EEF0FF, #C7D2FE)'
                : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              borderRadius: 20, height: 380,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '6rem', position: 'relative',
            }}>
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
              ) : (
                isDigital ? '💻' : '📦'
              )}
              <span className={`badge ${isDigital ? 'badge-digital' : 'badge-physical'}`}
                style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.85rem' }}>
                {isDigital ? '⚡ Digital' : '📦 Physical'}
              </span>
            </div>
          </div>

          {/* Right — Info */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category?.name?.en}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.3 }}>
              {name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className="stars" style={{ fontSize: '1.1rem' }}>{renderStars(product.averageRating)}</span>
              <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {product.averageRating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{
              background: '#EEF0FF', borderRadius: 12,
              padding: '1rem 1.25rem', marginBottom: '1.5rem',
              display: 'inline-block',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6C63FF' }}>
                €{(product.priceWithVAT || product.price * 1.19).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Net: €{product.price?.toFixed(2)} + 19% VAT (€{(product.price * 0.19).toFixed(2)})
              </div>
            </div>

            {/* Description */}
            {description && (
              <p style={{
                color: '#374151', lineHeight: 1.7,
                marginBottom: '1.5rem', fontSize: '0.95rem',
              }}>
                {description}
              </p>
            )}

            {/* Stock for physical */}
            {!isDigital && (
              <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                {product.stock > 0 ? (
                  <span style={{ color: '#10B981', fontWeight: 600 }}>
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>
                    ✕ Out of Stock
                  </span>
                )}
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              {!isDigital && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>
                    −
                  </button>
                  <span style={{ width: 32, textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!isDigital && product.stock === 0}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>

            {/* Digital info */}
            {isDigital && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#065F46',
              }}>
                ⚡ <strong>Instant Download</strong> — You will receive a secure download link by email immediately after payment
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {reviews.map(r => (
                <div key={r._id} style={{
                  background: '#fff', borderRadius: 12, padding: '1.25rem',
                  border: '1px solid #F3F4F6',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{r.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                      {new Date(r.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div className="stars" style={{ marginBottom: '0.5rem' }}>{renderStars(r.rating)}</div>
                  <p style={{ color: '#374151', fontSize: '0.9rem' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>No reviews yet — be the first!</p>
          )}

          {/* Write review form */}
          {user && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: '1.5rem',
              border: '1px solid #F3F4F6',
            }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Write a Review</h3>
              {reviewMsg && (
                <div className={`alert ${reviewMsg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>
                  {reviewMsg}
                </div>
              )}
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="form-select" style={{ width: 'auto' }}
                  >
                    {[5,4,3,2,1].map(r => (
                      <option key={r} value={r}>{'★'.repeat(r)} {r}/5</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4} className="form-input"
                    placeholder="Share your experience with this product..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;