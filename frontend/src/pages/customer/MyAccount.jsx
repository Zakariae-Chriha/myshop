import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MyAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('orders');

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      zip:     user?.address?.zip     || '',
      country: user?.address?.country || 'Germany',
    },
  });
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');

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
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSaveMsg('Profile updated successfully!');
      } else {
        setSaveMsg(data.message);
      }
    } catch {
      setSaveMsg('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusColors = {
    pending:    { bg: '#FEF3C7', color: '#92400E' },
    processing: { bg: '#EEF0FF', color: '#3C3489' },
    shipped:    { bg: '#D1FAE5', color: '#065F46' },
    delivered:  { bg: '#D1FAE5', color: '#065F46' },
    cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
          borderRadius: 20, padding: '2rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ color: '#fff', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.1)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
            padding: '0.5rem 1.25rem', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.875rem',
          }}>
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { key: 'orders',  label: 'My Orders' },
            { key: 'profile', label: 'Edit Profile' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.6rem 1.5rem', borderRadius: 8, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', border: 'none',
              background: tab === t.key ? '#6C63FF' : '#fff',
              color:      tab === t.key ? '#fff'    : '#374151',
              boxShadow:  tab === t.key ? '0 2px 8px rgba(108,99,255,0.3)' : 'none',
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
                <h3>No orders yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Start shopping to see your orders here</p>
                <Link to="/shop" className="btn btn-primary">Browse Products</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: '#fff', borderRadius: 16, padding: '1.5rem',
                    border: '1px solid #F3F4F6',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6C63FF' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                          background: statusColors[order.orderStatus]?.bg || '#F3F4F6',
                          color:      statusColors[order.orderStatus]?.color || '#374151',
                        }}>
                          {order.orderStatus}
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                          background: order.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7',
                          color:      order.paymentStatus === 'paid' ? '#065F46' : '#92400E',
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
                          fontSize: '0.875rem', marginBottom: '0.35rem', color: '#374151',
                        }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span style={{ fontWeight: 500 }}>€{(item.priceWithVAT * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '0.5rem',
                    }}>
                      <div style={{ fontWeight: 700, color: '#6C63FF' }}>
                        Total: €{order.total?.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {order.trackingNumber && (
                          <Link to={`/track?order=${order.orderNumber}`}
                            className="btn btn-outline btn-sm">
                            Track Order
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6', maxWidth: 600 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Profile</h3>

            {saveMsg && (
              <div className={`alert ${saveMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="form-input"
                  placeholder="+49 123 456789"
                />
              </div>

              <h4 style={{ margin: '1.25rem 0 1rem', color: '#374151' }}>Default Address</h4>

              <div className="form-group">
                <label className="form-label">Street</label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={e => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                  className="form-input"
                  placeholder="Street and number"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={profile.address.city}
                    onChange={e => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                    className="form-input"
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    value={profile.address.zip}
                    onChange={e => setProfile({ ...profile, address: { ...profile.address, zip: e.target.value } })}
                    className="form-input"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={profile.address.country}
                  onChange={e => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;