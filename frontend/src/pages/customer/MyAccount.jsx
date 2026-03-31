import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MyAccount = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('orders');

  const [profile, setProfile] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      zip:     user?.address?.zip     || '',
      country: user?.address?.country || 'Germany',
    },
  });
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/orders/my-orders', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res  = await fetch('http://localhost:5000/api/auth/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body:    JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSaveMsg('✅ Profile updated successfully!');
      } else {
        setSaveMsg('❌ ' + data.message);
      }
    } catch {
      setSaveMsg('❌ Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    pending:    { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
    processing: { bg: 'rgba(108,99,255,0.15)', color: '#A5B4FC' },
    shipped:    { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    delivered:  { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    cancelled:  { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F0F23, #1A1A2E)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 20, padding: '2rem',
          marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-50%', right: '-10%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(108,99,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#F1F5F9', marginBottom: '0.25rem', fontSize: '1.5rem' }}>{user?.name}</h2>
            <p style={{ color: '#475569', fontSize: '0.875rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{
                fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20,
                background: 'rgba(108,99,255,0.2)', color: '#A5B4FC', fontWeight: 600,
              }}>
                Customer
              </span>
              <span style={{
                fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20,
                background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600,
              }}>
                ✓ Verified
              </span>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/'); }} style={{
            background: 'rgba(239,68,68,0.1)',
            color: '#FCA5A5',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: '0.5rem 1.25rem', borderRadius: 8,
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
          }}>
            🚪 Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { key: 'orders',  label: '📦 My Orders' },
            { key: 'profile', label: '✏️ Edit Profile' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 10, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              background: tab === t.key ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)' : 'rgba(255,255,255,0.03)',
              color:      tab === t.key ? '#fff' : '#475569',
              border:     tab === t.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow:  tab === t.key ? '0 4px 16px rgba(108,99,255,0.3)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <h3 style={{ color: '#F1F5F9' }}>No orders yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Start shopping to see your orders here</p>
                <Link to="/shop" className="btn btn-primary">Browse Products</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '1.5rem',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#A5B4FC', fontFamily: 'monospace' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                          background: statusColors[order.orderStatus]?.bg || 'rgba(255,255,255,0.05)',
                          color:      statusColors[order.orderStatus]?.color || '#94A3B8',
                        }}>
                          {order.orderStatus}
                        </span>
                        <span style={{
                          padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                          background: order.paymentStatus === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color:      order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B',
                        }}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: '0.875rem', marginBottom: '0.35rem',
                          color: '#64748B',
                        }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span style={{ fontWeight: 500, color: '#94A3B8' }}>
                            €{(item.priceWithVAT * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                      flexWrap: 'wrap', gap: '0.5rem',
                    }}>
                      <div style={{ fontWeight: 800, color: '#A5B4FC', fontSize: '1.1rem' }}>
                        €{order.total?.toFixed(2)}
                      </div>
                      {order.trackingNumber && (
                        <Link to={`/track?order=${order.orderNumber}`}
                          className="btn btn-outline btn-sm">
                          🔍 Track Order
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '2rem',
            maxWidth: 600,
          }}>
            <h3 style={{ color: '#F1F5F9', marginBottom: '1.5rem' }}>Edit Profile</h3>

            {saveMsg && (
              <div className={`alert ${saveMsg.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="form-input" placeholder="+49 123 456789" />
              </div>

              <h4 style={{ color: '#94A3B8', margin: '1.25rem 0 1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Default Address
              </h4>

              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" value={profile.address.street}
                  onChange={e => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                  className="form-input" placeholder="Street and number" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" value={profile.address.city}
                    onChange={e => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                    className="form-input" placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input type="text" value={profile.address.zip}
                    onChange={e => setProfile({ ...profile, address: { ...profile.address, zip: e.target.value } })}
                    className="form-input" placeholder="12345" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" value={profile.address.country}
                  onChange={e => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                  className="form-input" />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;