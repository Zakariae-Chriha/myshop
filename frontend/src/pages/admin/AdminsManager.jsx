import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';

const AdminsManager = () => {
  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name: '', email: '', password: '' });
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAdmins = () => {
    fetch(`${BASE_URL}/api/admin/admins`, { headers })
      .then(r => r.json())
      .then(d => setAdmins(d.admins || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await fetch(BASE_URL + '/api/admin/create-admin', {
        method: 'POST', headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg('Admin created successfully!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      fetchAdmins();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove admin access for ${name}?`)) return;
    try {
      await fetch(`${BASE_URL}/api/admin/admins/${id}`, {
        method: 'DELETE', headers,
      });
      setMsg('Admin removed');
      fetchAdmins();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Accounts</h1>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage who has access to the admin panel
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('Error') || msg.includes('error') ? 'alert-error' : 'alert-success'}`}
            style={{ marginBottom: '1rem' }}>
            {msg}
          </div>
        )}

        {showForm && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Admin</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="form-input" placeholder="Admin name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="form-input" placeholder="admin@email.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="form-input" placeholder="Min 6 characters"
                    minLength={6} required />
                </div>
              </div>

              <div style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8, padding: '0.75rem 1rem',
                fontSize: '0.8rem', color: '#FCD34D', marginBottom: '1rem',
              }}>
                ⚠️ Admin accounts have full access to everything. Only create for trusted people.
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Creating...' : 'Create Admin Account'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Admin', 'Email', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 600,
                      color: '#475569', textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                        }}>
                          {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F9' }}>
                            {admin.name}
                          </div>
                          <span style={{
                            fontSize: '0.7rem', padding: '1px 7px', borderRadius: 20,
                            background: 'rgba(108,99,255,0.2)', color: '#A5B4FC', fontWeight: 600,
                          }}>
                            Admin
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#94A3B8' }}>
                      {admin.email}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {new Date(admin.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleRemove(admin._id, admin.name)}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: 8,
                          fontSize: '0.8rem',
                          background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                          border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                        }}>
                        Remove Admin
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

export default AdminsManager;