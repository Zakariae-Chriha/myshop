import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';

const emptyForm = {
  code: '', discountType: 'percent', discountValue: '',
  minOrderAmount: 0, expiryDate: '', usageLimit: 100, isActive: true,
};

const CouponsManager = () => {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchCoupons = () => {
    fetch(`${BASE_URL}/api/coupons/admin`, { headers })
      .then(r => r.json())
      .then(d => setCoupons(d.coupons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await fetch(BASE_URL + '/api/coupons/admin', {
        method: 'POST', headers,
        body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg('Coupon created!');
      setShowForm(false);
      setForm(emptyForm);
      fetchCoupons();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await fetch(`${BASE_URL}/api/coupons/admin/${id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ isActive: !current }),
      });
      fetchCoupons();
    } catch { /* ignore network errors */ }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Coupons</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Create Coupon'}
          </button>
        </div>

        {msg && <div className={`alert ${msg.includes('Error') || msg.includes('error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>{msg}</div>}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #F3F4F6' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>New Coupon</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="form-input" placeholder="SUMMER20" required
                    style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="form-select">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                    className="form-input" placeholder={form.discountType === 'percent' ? '20 (= 20%)' : '10 (= €10)'} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order Amount (€)</label>
                  <input type="number" value={form.minOrderAmount}
                    onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Usage Limit</label>
                  <input type="number" value={form.usageLimit}
                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                    className="form-input" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : coupons.length === 0 ? (
          <div className="empty-state"><div className="icon">🎟️</div><h3>No coupons yet</h3></div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  {['Code', 'Discount', 'Min Order', 'Used', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: '#6C63FF', background: '#EEF0FF', padding: '3px 10px', borderRadius: 6 }}>
                        {coupon.code}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>€{coupon.minOrderAmount}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{coupon.usedCount} / {coupon.usageLimit}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {new Date(coupon.expiryDate).toLocaleDateString('de-DE')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: coupon.isActive ? '#D1FAE5' : '#FEE2E2',
                        color:      coupon.isActive ? '#065F46' : '#991B1B',
                      }}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => toggleActive(coupon._id, coupon.isActive)}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem',
                          background: coupon.isActive ? '#FEF2F2' : '#D1FAE5',
                          color:      coupon.isActive ? '#DC2626' : '#065F46',
                          border: 'none', cursor: 'pointer', fontWeight: 500,
                        }}>
                        {coupon.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CouponsManager;