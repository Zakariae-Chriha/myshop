import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';
import toast from 'react-hot-toast';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPending = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/reviews/admin/pending`, { headers })
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/admin/${id}/approve`, { method: 'PUT', headers });
      if (!res.ok) throw new Error();
      toast.success('Review approved');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      toast.error('Failed to approve');
    }
  };

  const reject = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/admin/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      toast.success('Review rejected & deleted');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: '1.25rem',
    marginBottom: '0.75rem',
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#F1F5F9', marginBottom: '0.25rem' }}>Review Moderation</h1>
        <p style={{ color: '#475569' }}>
          {loading ? 'Loading...' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} pending approval`}
        </p>
      </div>

      {!loading && reviews.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>All caught up!</h3>
          <p style={{ color: '#475569' }}>No reviews pending moderation.</p>
        </div>
      )}

      {reviews.map(review => (
        <div key={review._id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Product + user */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', color: '#A5B4FC', fontWeight: 600,
                }}>
                  {review.product?.name?.en || review.product?.name || 'Product'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>by</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                  {review.user?.name || 'Unknown'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#334155' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Stars */}
              <div style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.5rem' }}>
                {renderStars(review.rating)}
                <span style={{ color: '#475569', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  {review.rating}/5
                </span>
              </div>

              {/* Comment */}
              <p style={{
                color: '#CBD5E1', fontSize: '0.875rem', lineHeight: 1.6,
                background: 'rgba(255,255,255,0.02)', borderRadius: 8,
                padding: '0.75rem', borderLeft: '3px solid rgba(108,99,255,0.3)',
                margin: 0,
              }}>
                "{review.comment}"
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => approve(review._id)} style={{
                padding: '0.55rem 1.25rem', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(16,185,129,0.12)', color: '#10B981',
                border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
              >
                ✓ Approve
              </button>
              <button onClick={() => reject(review._id)} style={{
                padding: '0.55rem 1.25rem', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                border: '1px solid rgba(239,68,68,0.25)', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
};

export default ReviewsManager;
