import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../../components/ProductCard';
import BASE_URL from '../../api/config';
import useSEO from '../../hooks/useSEO';

const Shop = () => {
  const { t } = useTranslation();
  useSEO({ title: t('shop.title'), description: 'Browse all products — digital downloads and physical goods.' });
  const [searchParams] = useSearchParams();

  const [products,     setProducts]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [pagination,   setPagination]   = useState({});

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search,      setSearch]      = useState(searchParams.get('search') || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || '');
  const [type,        setType]        = useState('');
  const [sort,        setSort]        = useState('newest');
  const [page,        setPage]        = useState(1);

  const debounceRef = useRef(null);
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set('search',   search);
    if (category) params.set('category', category);
    if (type)     params.set('type',     type);
    params.set('sort',  sort);
    params.set('page',  page);
    params.set('limit', 12);

    fetch(`${BASE_URL}/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setPagination(d.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, type, sort, page]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '3rem 0 2rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '0.5rem' }}>{t('shop.title')}</h1>
          <p style={{ color: '#475569' }}>
            {pagination.total || 0} {t('shop.available')}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>🔍</span>
            <input
              type="text"
              placeholder={t('shop.search')}
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="form-select" style={{ width: 'auto', minWidth: 160 }}>
            <option value="">{t('shop.all_categories')}</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name?.en}</option>
            ))}
          </select>

          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
            className="form-select" style={{ width: 'auto', minWidth: 140 }}>
            <option value="">{t('shop.all_types')}</option>
            <option value="digital">{t('shop.digital')}</option>
            <option value="physical">{t('shop.physical')}</option>
          </select>

          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="form-select" style={{ width: 'auto', minWidth: 160 }}>
            <option value="newest">{t('shop.newest')}</option>
            <option value="bestseller">{t('shop.bestseller')}</option>
            <option value="price">{t('shop.price_asc')}</option>
            <option value="-price">{t('shop.price_desc')}</option>
            <option value="rating">{t('shop.top_rated')}</option>
          </select>

          {(searchInput || category || type || sort !== 'newest') && (
            <button onClick={() => { setSearchInput(''); setSearch(''); setCategory(''); setType(''); setSort('newest'); setPage(1); }}
              style={{
                padding: '0.6rem 1rem', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem',
                cursor: 'pointer',
              }}>
              {t('shop.clear')}
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button onClick={() => setCategory('')} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem',
            fontWeight: 500, cursor: 'pointer',
            background: !category ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)' : 'rgba(255,255,255,0.05)',
            color: !category ? '#fff' : '#94A3B8',
            border: !category ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}>
            {t('shop.all')}
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setCategory(c._id)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem',
              fontWeight: 500, cursor: 'pointer',
              background: category === c._id ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)' : 'rgba(255,255,255,0.05)',
              color: category === c._id ? '#fff' : '#94A3B8',
              border: category === c._id ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}>
              {c.icon} {c.name?.en}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`page-btn ${page === p ? 'active' : ''}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>{t('shop.no_products')}</h3>
            <p>{t('shop.adjust_filters')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
