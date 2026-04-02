import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';

const emptyForm = {
  name:        { en: '', de: '', ar: '' },
  description: { en: '', de: '', ar: '' },
  icon:  '📦',
  color: '#6C63FF',
};

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState('');

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchCategories = () => {
    fetch(`${BASE_URL}/api/categories`, { headers })
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editId ? `${BASE_URL}/api/categories/${editId}` : BASE_URL + '/api/categories';
      const method = editId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg(editId ? 'Category updated!' : 'Category created!');
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchCategories();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({
      name:        cat.name        || { en: '', de: '', ar: '' },
      description: cat.description || { en: '', de: '', ar: '' },
      icon:  cat.icon  || '📦',
      color: cat.color || '#6C63FF',
    });
    setEditId(cat._id);
    setShowForm(true);
  };

  const icons = ['📦', '🎓', '📚', '🎨', '💻', '📷', '🎵', '🎮', '💼', '🏠', '⚡', '🔧'];

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Categories</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null); }}
            className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>
            {msg}
          </div>
        )}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #F3F4F6' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editId ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {['en', 'de', 'ar'].map(lang => (
                  <div key={lang} className="form-group">
                    <label className="form-label">Name ({lang.toUpperCase()})</label>
                    <input
                      value={form.name[lang]}
                      onChange={e => setForm({ ...form, name: { ...form.name, [lang]: e.target.value } })}
                      className="form-input"
                      placeholder={`Name in ${lang}`}
                      required={lang === 'en'}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {['en', 'de', 'ar'].map(lang => (
                  <div key={lang} className="form-group">
                    <label className="form-label">Description ({lang.toUpperCase()})</label>
                    <textarea
                      value={form.description[lang]}
                      onChange={e => setForm({ ...form, description: { ...form.description, [lang]: e.target.value } })}
                      className="form-input" rows={2}
                      placeholder={`Description in ${lang}`}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {icons.map(icon => (
                      <button key={icon} type="button"
                        onClick={() => setForm({ ...form, icon })}
                        style={{
                          width: 40, height: 40, borderRadius: 8, fontSize: '1.2rem',
                          border: form.icon === icon ? '2px solid #6C63FF' : '1px solid #E5E7EB',
                          background: form.icon === icon ? '#EEF0FF' : '#fff',
                          cursor: 'pointer',
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {['#6C63FF', '#FF6584', '#10B981', '#F59E0B', '#EC4899', '#0F3460', '#EF4444', '#8B5CF6'].map(color => (
                      <button key={color} type="button"
                        onClick={() => setForm({ ...form, color })}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: color, border: form.color === color ? '3px solid #1F2937' : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 4, background: form.color }} />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{form.color}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : editId ? 'Update Category' : 'Create Category'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                  className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {categories.map(cat => (
              <div key={cat._id} style={{
                background: '#fff', borderRadius: 16, padding: '1.5rem',
                border: '1px solid #F3F4F6',
                borderLeft: `4px solid ${cat.color || '#6C63FF'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: (cat.color || '#6C63FF') + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {cat.icon || '📦'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>{cat.name?.en}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{cat.slug}</div>
                  </div>
                </div>

                {cat.description?.en && (
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {cat.description.en}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(cat)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', background: '#EEF0FF', color: '#6C63FF', border: 'none', cursor: 'pointer' }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesManager;