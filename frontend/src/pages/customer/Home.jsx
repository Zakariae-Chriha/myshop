import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/products?limit=6&sort=bestseller'),
          fetch('http://localhost:5000/api/categories'),
        ]);
        const prodData = await prodRes.json();
        const catData  = await catRes.json();
        setFeatured(prodData.products   || []);
        setCategories(catData.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(108,99,255,0.15)',
        }}/>
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,101,132,0.10)',
        }}/>

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(108,99,255,0.2)', color: '#A5B4FC',
            padding: '0.4rem 1rem', borderRadius: 20,
            fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem',
          }}>
            ⚡ Digital Products — Instant Download
          </div>

          <h1 style={{
            color: '#fff', fontSize: '3rem', fontWeight: 800,
            marginBottom: '1rem', lineHeight: 1.15,
          }}>
            Learn, Create &<br />
            <span style={{
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Grow Your Skills
            </span>
          </h1>

          <p style={{
            color: '#94A3B8', fontSize: '1.1rem',
            maxWidth: 520, margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Premium courses, ebooks, and templates to accelerate your career.
            Instant access after purchase.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Browse Products →
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Join Free
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '3rem', justifyContent: 'center',
            marginTop: '3rem', flexWrap: 'wrap',
          }}>
            {[
              { value: '500+', label: 'Products' },
              { value: '10k+', label: 'Students' },
              { value: '4.9★', label: 'Rating' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800 }}>{value}</div>
                <div style={{ color: '#64748B', fontSize: '0.875rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section" style={{ background: '#F9FAFB' }}>
          <div className="container">
            <div className="section-heading">
              <h2>Browse Categories</h2>
              <p>Find exactly what you are looking for</p>
              <div className="underline" />
            </div>
            <div className="categories-grid">
              {categories.map((cat, i) => {
                const emojis = ['💻', '📚', '🎨', '📊', '🎯', '🔧'];
                const colors = ['#EEF0FF', '#D1FAE5', '#FEF3C7', '#FCE7F3', '#E0F2FE', '#F3E8FF'];
                return (
                  <Link key={cat._id} to={`/shop?category=${cat._id}`}>
                    <div style={{
                      background: colors[i % colors.length],
                      borderRadius: 16, padding: '1.5rem 1rem',
                      textAlign: 'center', cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {emojis[i % emojis.length]}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' }}>
                        {cat.name?.en || cat.name}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Featured Products</h2>
            <p>Our best-selling digital products this month</p>
            <div className="underline" />
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>No products yet</h3>
              <p>Add products from the admin panel to see them here</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/shop" className="btn btn-outline">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────────── */}
      <section className="section" style={{ background: '#F9FAFB' }}>
        <div className="container">
          <div className="section-heading">
            <h2>Why Choose Us</h2>
            <div className="underline" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { icon: '⚡', title: 'Instant Access', desc: 'Download your products immediately after payment' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Your payment is encrypted and 100% secure with Stripe' },
              { icon: '⭐', title: 'Top Quality', desc: 'All products are reviewed and curated by our team' },
              { icon: '🇩🇪', title: 'Made in Germany', desc: 'Fully compliant with German law and GDPR regulations' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: '#fff', borderRadius: 16,
                padding: '1.75rem', textAlign: 'center',
                border: '1px solid #F3F4F6',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#1F2937' }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
        padding: '4rem 0', textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Join thousands of students and professionals already using our platform
          </p>
          <Link to="/shop" style={{
            background: '#fff', color: '#6C63FF',
            padding: '0.85rem 2.5rem', borderRadius: 10,
            fontWeight: 700, fontSize: '1rem', display: 'inline-block',
          }}>
            Start Shopping →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;