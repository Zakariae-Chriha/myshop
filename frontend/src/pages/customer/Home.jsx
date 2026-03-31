import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/products?limit=6&sort=bestseller').then(r => r.json()),
      fetch('http://localhost:5000/api/categories').then(r => r.json()),
    ]).then(([p, c]) => {
      setFeatured(p.products   || []);
      setCategories(c.categories || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0 5rem' }}>

        {/* Background glows */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,101,132,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(108,99,255,0.12)',
            border: '1px solid rgba(108,99,255,0.25)',
            color: '#A5B4FC', padding: '0.4rem 1.1rem',
            borderRadius: 20, fontSize: '0.82rem', fontWeight: 500,
            marginBottom: '1.75rem',
            animation: 'fadeInUp 0.6s ease forwards',
          }}>
            ⚡ New products added every week
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900, color: '#fff',
            marginBottom: '1.25rem', lineHeight: 1.1,
            animation: 'fadeInUp 0.6s 0.1s ease both',
          }}>
            Premium Digital<br />
            <span className="gradient-text">Products & Courses</span>
          </h1>

          <p style={{
            color: '#64748B', fontSize: '1.1rem',
            maxWidth: 520, margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            animation: 'fadeInUp 0.6s 0.2s ease both',
          }}>
            Courses, ebooks, templates and tools — instant download after purchase.
            Trusted by 10,000+ professionals worldwide.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '4rem',
            animation: 'fadeInUp 0.6s 0.3s ease both',
          }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Browse Products →
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Join Free — No Credit Card
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '0', justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '1.5rem 2rem',
            maxWidth: 500, margin: '0 auto',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.6s 0.4s ease both',
          }}>
            {[
              { value: '500+',  label: 'Products',  icon: '🛍️' },
              { value: '10k+',  label: 'Customers', icon: '👥' },
              { value: '4.9★', label: 'Rating',    icon: '⭐' },
            ].map(({ value, label, icon }, i) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center', padding: '0 1.5rem',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container">
            <div className="section-heading">
              <h2>Browse Categories</h2>
              <p>Find exactly what you are looking for</p>
              <div className="underline" />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem',
            }}>
              {categories.map((cat) => (
                <Link key={cat._id} to={`/shop?category=${cat._id}`}>
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '1.5rem 1rem',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform   = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = cat.color || 'rgba(108,99,255,0.4)';
                      e.currentTarget.style.background  = 'rgba(108,99,255,0.08)';
                      e.currentTarget.style.boxShadow   = `0 8px 32px ${cat.color || '#6C63FF'}25`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform   = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.background  = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.boxShadow   = 'none';
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: (cat.color || '#6C63FF') + '20',
                      border: `1px solid ${cat.color || '#6C63FF'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.6rem', margin: '0 auto 0.75rem',
                    }}>
                      {cat.icon || '📦'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F1F5F9', marginBottom: '0.35rem' }}>
                      {cat.name?.en || cat.name}
                    </div>
                    {cat.description?.en && (
                      <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                        {cat.description.en}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────── */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
              <p>Add products from the admin panel</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn-outline btn-lg">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────── */}
      <section style={{
        padding: '4rem 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div className="container">
          <div className="section-heading">
            <h2>Why Choose Us</h2>
            <div className="underline" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: '⚡', title: 'Instant Access',    desc: 'Download immediately after payment confirmation' },
              { icon: '🔒', title: 'Secure Payment',    desc: 'All payments encrypted and processed by Stripe' },
              { icon: '⭐', title: 'Top Quality',       desc: 'All products reviewed and curated by our team' },
              { icon: '🇩🇪', title: 'German Standards', desc: 'GDPR compliant — your data is always protected' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '1.75rem',
                textAlign: 'center', transition: 'all 0.3s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)';
                  e.currentTarget.style.background  = 'rgba(108,99,255,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h4 style={{ color: '#F1F5F9', marginBottom: '0.5rem' }}>{title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section style={{
        padding: '5rem 0', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
            Ready to Level Up Your Skills?
          </h2>
          <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Join thousands of professionals already learning with our platform
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex' }}>
            Start Shopping →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;