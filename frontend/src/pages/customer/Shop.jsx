import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({});

  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type,     setType]     = useState('');
  const [sort,     setSort]     = useState('newest');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set('search',   search);
    if (category) params.set('category', category);
    if (type)     params.set('type',     type);
    if (sort)     params.set('sort',     sort);
    params.set('page',  page);
    params.set('limit', 12);

    fetch(`http://localhost:5000/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setPagination(d.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, type, sort, page]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
        padding: '3rem 0', textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '0.5rem' }}>All Products</h1>
          <p style={{ color: '#94A3B8' }}>
            {pagination.total || 0} products available
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* ── Filters bar ─────────────────────────────────────── */}
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: '1.25rem', marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          alignItems: 'center',
        }}>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#9CA3AF',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name?.en || c.name}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="">All Types</option>
            <option value="digital">⚡ Digital</option>
            <option value="physical">📦 Physical</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="newest">Newest First</option>
            <option value="bestseller">Best Sellers</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* Clear filters */}
          {(search || category || type || sort !== 'newest') && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setType(''); setSort('newest'); setPage(1); }}
              style={{
                padding: '0.6rem 1rem', borderRadius: 8,
                background: '#FEF2F2', color: '#DC2626',
                border: '1px solid #FECACA', fontSize: '0.875rem',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Category pills ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCategory('')}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem',
              fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
              background: !category ? '#6C63FF' : '#fff',
              color:      !category ? '#fff'    : '#374151',
              borderColor: !category ? '#6C63FF' : '#D1D5DB',
            }}
          >
            All
          </button>
          {categories.map(c => (
            <button key={c._id}
              onClick={() => setCategory(c._id)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem',
                fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
                background: category === c._id ? '#6C63FF' : '#fff',
                color:      category === c._id ? '#fff'    : '#374151',
                borderColor: category === c._id ? '#6C63FF' : '#D1D5DB',
              }}
            >
              {c.name?.en || c.name}
            </button>
          ))}
        </div>

        {/* ── Products grid ────────────────────────────────────── */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;