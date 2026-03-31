import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const emptyForm = {
  name:        { en: '', de: '', ar: '' },
  description: { en: '', de: '', ar: '' },
  price:       '',
  productType: 'digital',
  category:    '',
  stock:       999,
  images:      [],
  isActive:    true,
};

const ProductsManager = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [msg,        setMsg]        = useState('');

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAll = () => {
    Promise.all([
      fetch('http://localhost:5000/api/products?limit=50', { headers }).then(r => r.json()),
      fetch('http://localhost:5000/api/categories').then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products || []);
      setCategories(c.categories || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res  = await fetch('http://localhost:5000/api/upload/image', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, images: [data.url] }));
        setMsg('Image uploaded!');
        setTimeout(() => setMsg(''), 2000);
      } else {
        setMsg('Upload failed: ' + data.message);
      }
    } catch (err) {
      setMsg('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editId ? `http://localhost:5000/api/products/${editId}` : 'http://localhost:5000/api/products';
      const method = editId ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method, headers,
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg(editId ? 'Product updated!' : 'Product created!');
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name:        product.name        || { en: '', de: '', ar: '' },
      description: product.description || { en: '', de: '', ar: '' },
      price:       product.price       || '',
      productType: product.productType || 'digital',
      category:    product.category?._id || product.category || '',
      stock:       product.stock       || 0,
      images:      product.images      || [],
      isActive:    product.isActive,
    });
    setEditId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE', headers });
    setMsg('Product deactivated');
    fetchAll();
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Products</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null); }}
            className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('error') || msg.includes('Error') || msg.includes('failed') ? 'alert-error' : 'alert-success'}`}
            style={{ marginBottom: '1rem' }}>
            {msg}
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #F3F4F6' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editId ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit}>

              {/* Image upload — INSIDE form */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Product Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {form.images?.[0] && (
                    <div style={{ position: 'relative' }}>
                      <img src={form.images[0]} alt="Product"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid #E5E7EB' }}
                      />
                      <button type="button"
                        onClick={() => setForm({ ...form, images: [] })}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#EF4444', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: '12px',
                        }}>
                        ✕
                      </button>
                    </div>
                  )}
                  <label style={{
                    width: 100, height: 100, borderRadius: 10,
                    border: '2px dashed #D1D5DB', background: '#F9FAFB',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem', color: '#6B7280', gap: '0.25rem',
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📷</span>
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
                  Max 5MB · JPG, PNG, WebP
                </p>
              </div>

              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {['en', 'de', 'ar'].map(lang => (
                  <div key={lang} className="form-group">
                    <label className="form-label">Name ({lang.toUpperCase()})</label>
                    <input
                      value={form.name[lang]}
                      onChange={e => setForm({ ...form, name: { ...form.name, [lang]: e.target.value } })}
                      className="form-input" placeholder={`Name in ${lang}`}
                      required={lang === 'en'}
                    />
                  </div>
                ))}
              </div>

              {/* Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {['en', 'de', 'ar'].map(lang => (
                  <div key={lang} className="form-group">
                    <label className="form-label">Description ({lang.toUpperCase()})</label>
                    <textarea
                      value={form.description[lang]}
                      onChange={e => setForm({ ...form, description: { ...form.description, [lang]: e.target.value } })}
                      className="form-input" rows={3}
                      placeholder={`Description in ${lang}`}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>

              {/* Price, Type, Category, Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (€ net)</label>
                  <input type="number" step="0.01" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={form.productType}
                    onChange={e => setForm({ ...form, productType: e.target.value })}
                    className="form-select">
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="form-select" required>
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name?.en}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                  className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Products table ─────────────────────────────────────── */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  {['Image', 'Product', 'Type', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                        background: product.productType === 'digital' ? '#EEF0FF' : '#D1FAE5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}>
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={product.name?.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : product.productType === 'digital' ? '💻' : '📦'
                        }
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name?.en}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{product.category?.name?.en}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${product.productType === 'digital' ? 'badge-digital' : 'badge-physical'}`}>
                        {product.productType}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#6C63FF' }}>
                      €{product.priceWithVAT?.toFixed(2)}
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>net: €{product.price?.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <span style={{ color: product.stock < 5 ? '#EF4444' : '#374151', fontWeight: product.stock < 5 ? 700 : 400 }}>
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>{product.totalSold}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: product.isActive ? '#D1FAE5' : '#FEE2E2',
                        color:      product.isActive ? '#065F46' : '#991B1B',
                      }}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(product)}
                          style={{ padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', background: '#EEF0FF', color: '#6C63FF', border: 'none', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)}
                          style={{ padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
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

export default ProductsManager;