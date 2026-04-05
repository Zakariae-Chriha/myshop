import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../../components/ProductCard';
import BASE_URL from '../../api/config';
import useSEO from '../../hooks/useSEO';

// ─── Animated Counter ──────────────────────────────────────────────────────
const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps    = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ─── Floating Card ─────────────────────────────────────────────────────────
const FloatingCard = ({ icon, title, price, badge, delay, x, y, rotate }) => (
  <div style={{
    position: 'absolute', left: x, top: y,
    background: 'rgba(15,15,35,0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(108,99,255,0.25)',
    borderRadius: 16, padding: '0.875rem 1.1rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    minWidth: 180,
    transform: `rotate(${rotate}deg)`,
    animation: `floatCard 4s ease-in-out ${delay}s infinite`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,99,255,0.1)',
    zIndex: 3,
    pointerEvents: 'none',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.3rem',
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.1rem' }}>{title}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{price}</div>
    </div>
    {badge && (
      <div style={{
        position: 'absolute', top: -8, right: 10,
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: '#fff', fontSize: '0.6rem', fontWeight: 700,
        padding: '2px 8px', borderRadius: 20,
      }}>{badge}</div>
    )}
  </div>
);

// ─── Home ──────────────────────────────────────────────────────────────────
const Home = () => {
  const { t } = useTranslation();
  useSEO({ title: 'Home', description: 'ZC Brands — Selected German Quality.' });

  const [featured,    setFeatured]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });
  const [typeIndex,   setTypeIndex]   = useState(0);
  const heroRef = useRef(null);

  const typeWords = ['Digital Products', 'Online Courses', 'Premium Tools', 'Expert Templates'];

  // Typing effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTypeIndex(i => (i + 1) % typeWords.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Parallax mouse effect
  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/products?limit=6&sort=bestseller`).then(r => r.json()),
      fetch(`${BASE_URL}/api/categories`).then(r => r.json()),
    ]).then(([p, c]) => {
      setFeatured(p.products   || []);
      setCategories(c.categories || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', padding: '4rem 0',
      }}>

        {/* Animated background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }} />

        {/* Big orbs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-5%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)',
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          transition: 'transform 0.3s ease',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 65%)',
          transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)`,
          transition: 'transform 0.3s ease',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '4rem', alignItems: 'center',
          }} className="hero-grid">

            {/* ── LEFT: Text ── */}
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 30, padding: '0.4rem 1rem 0.4rem 0.5rem',
                marginBottom: '2rem',
                animation: 'fadeInUp 0.6s ease both',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                }}>NEW</span>
                <span style={{ fontSize: '0.82rem', color: '#A5B4FC' }}>
                  ⚡ {t('home.badge')}
                </span>
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
                fontWeight: 900, color: '#fff',
                lineHeight: 1.08, marginBottom: '1rem',
                letterSpacing: '-0.03em',
                animation: 'fadeInUp 0.6s 0.1s ease both',
              }}>
                Selected<br />
                <span style={{
                  background: 'linear-gradient(135deg, #C9A84C, #F5D78E, #C9A84C)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>German Quality</span>
              </h1>

              {/* Typewriter */}
              <div style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                fontWeight: 600, color: '#6C63FF',
                marginBottom: '1.5rem', height: '2.2rem',
                animation: 'fadeInUp 0.6s 0.15s ease both',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ color: '#475569' }}>—</span>
                <span key={typeIndex} style={{ animation: 'typeIn 0.4s ease both' }}>
                  {typeWords[typeIndex]}
                </span>
                <span style={{
                  width: 3, height: '1.4rem', background: '#6C63FF',
                  borderRadius: 2, animation: 'blink 1s step-end infinite',
                  flexShrink: 0,
                }} />
              </div>

              <p style={{
                color: '#64748B', fontSize: '1.05rem',
                maxWidth: 480, lineHeight: 1.75,
                marginBottom: '2.5rem',
                animation: 'fadeInUp 0.6s 0.2s ease both',
              }}>
                {t('home.hero_desc')}
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex', gap: '1rem', flexWrap: 'wrap',
                animation: 'fadeInUp 0.6s 0.25s ease both',
              }}>
                <Link to="/shop" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 2rem', borderRadius: 12, fontWeight: 700,
                  fontSize: '1rem', color: '#fff', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                  boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(108,99,255,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,99,255,0.4)'; }}
                >
                  {t('home.browse_products')} <span style={{ fontSize: '1.2rem' }}>→</span>
                </Link>

                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.9rem 2rem', borderRadius: 12, fontWeight: 600,
                  fontSize: '1rem', color: '#94A3B8',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s', textDecoration: 'none',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  🎁 {t('home.join_free')}
                </Link>
              </div>

              {/* Trust row */}
              <div style={{
                display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap',
                animation: 'fadeInUp 0.6s 0.35s ease both',
              }}>
                {[
                  { icon: '🔒', text: 'SSL Secure' },
                  { icon: '🇩🇪', text: 'GDPR Compliant' },
                  { icon: '⚡', text: 'Instant Delivery' },
                  { icon: '↩️', text: '30-Day Returns' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Visual ── */}
            <div style={{
              position: 'relative', height: 520,
              animation: 'fadeInUp 0.8s 0.3s ease both',
            }} className="hero-visual">

              {/* Central glowing orb */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${mousePos.x * 0.8}px), calc(-50% + ${mousePos.y * 0.8}px))`,
                transition: 'transform 0.2s ease',
                width: 280, height: 280, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, rgba(108,99,255,0.05) 50%, transparent 70%)',
                zIndex: 1,
              }}>
                {/* Ring 1 */}
                <div style={{
                  position: 'absolute', inset: -30, borderRadius: '50%',
                  border: '1px solid rgba(108,99,255,0.15)',
                  animation: 'spinSlow 20s linear infinite',
                }}>
                  <div style={{
                    position: 'absolute', top: -6, left: '50%',
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    boxShadow: '0 0 16px rgba(108,99,255,0.8)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>
                {/* Ring 2 */}
                <div style={{
                  position: 'absolute', inset: -70, borderRadius: '50%',
                  border: '1px solid rgba(255,101,132,0.1)',
                  animation: 'spinSlow 30s linear infinite reverse',
                }}>
                  <div style={{
                    position: 'absolute', bottom: -5, right: '20%',
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#FF6584',
                    boxShadow: '0 0 12px rgba(255,101,132,0.8)',
                  }} />
                </div>
                {/* Ring 3 */}
                <div style={{
                  position: 'absolute', inset: -110, borderRadius: '50%',
                  border: '1px solid rgba(16,185,129,0.08)',
                  animation: 'spinSlow 40s linear infinite',
                }}>
                  <div style={{
                    position: 'absolute', top: '30%', left: -5,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 10px rgba(16,185,129,0.8)',
                  }} />
                </div>

                {/* Center logo / icon */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '28px',
                    background: 'linear-gradient(135deg, #0F0F23, #1a1a35)',
                    border: '1px solid rgba(108,99,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(108,99,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    animation: 'pulse-glow 3s ease-in-out infinite',
                  }}>
                    <img src="/logo.png" alt="ZC Brands" style={{
                      width: 90, height: 90, objectFit: 'contain',
                      mixBlendMode: 'screen',
                    }} />
                  </div>
                </div>
              </div>

              {/* Floating product cards */}
              <FloatingCard icon="💻" title="UI Kit Pro" price="€49.99" badge="NEW" delay={0}   x="2%"  y="5%"  rotate={-3} />
              <FloatingCard icon="📚" title="Course Bundle" price="€89.99" badge="HOT" delay={1} x="55%" y="3%"  rotate={2} />
              <FloatingCard icon="🎨" title="Design Pack" price="€29.99" delay={0.5} x="5%"  y="72%" rotate={2} />
              <FloatingCard icon="⚡" title="Plugin Suite" price="€19.99" badge="SALE" delay={1.5} x="52%" y="75%" rotate={-2} />

              {/* Stats floating badges */}
              <div style={{
                position: 'absolute', top: '42%', left: '-8%',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 12, padding: '0.6rem 1rem',
                animation: 'floatCard 5s ease-in-out 0.5s infinite',
                zIndex: 4,
              }}>
                <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customers</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  <Counter target={10000} suffix="+" />
                </div>
              </div>

              <div style={{
                position: 'absolute', top: '40%', right: '-6%',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 12, padding: '0.6rem 1rem',
                animation: 'floatCard 4.5s ease-in-out 1s infinite',
                zIndex: 4,
              }}>
                <div style={{ fontSize: '0.65rem', color: '#F59E0B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>4.9 ★</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, var(--bg-primary))',
          pointerEvents: 'none', zIndex: 3,
        }} />
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
        padding: '2rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem', textAlign: 'center',
          }} className="stats-grid">
            {[
              { value: 500,  suffix: '+', label: 'Products',  icon: '🛍️', color: '#6C63FF' },
              { value: 10000, suffix: '+', label: 'Customers', icon: '👥', color: '#10B981' },
              { value: 50,   suffix: '+', label: 'Categories', icon: '🗂️', color: '#F59E0B' },
              { value: 99,   suffix: '%', label: 'Satisfaction', icon: '⭐', color: '#FF6584' },
            ].map(({ value, suffix, label, icon, color }) => (
              <div key={label} style={{ padding: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.25rem' }}>
                  <Counter target={value} suffix={suffix} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div className="section-heading">
              <h2>{t('home.categories_title')}</h2>
              <p>{t('home.categories_desc')}</p>
              <div className="underline" />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem',
            }}>
              {categories.map((cat, i) => (
                <Link key={cat._id} to={`/shop?category=${cat._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, padding: '1.5rem 1rem',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    animation: `fadeInUp 0.5s ${i * 0.05}s ease both`,
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform   = 'translateY(-6px) scale(1.02)';
                      e.currentTarget.style.borderColor = cat.color || 'rgba(108,99,255,0.4)';
                      e.currentTarget.style.background  = (cat.color || '#6C63FF') + '10';
                      e.currentTarget.style.boxShadow   = `0 12px 40px ${cat.color || '#6C63FF'}20`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform   = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.background  = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.boxShadow   = 'none';
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: (cat.color || '#6C63FF') + '20',
                      border: `1px solid ${cat.color || '#6C63FF'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', margin: '0 auto 0.75rem',
                    }}>
                      {cat.icon || '📦'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F1F5F9' }}>
                      {cat.name?.en || cat.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div className="section-heading">
            <h2>{t('home.featured_title')}</h2>
            <p>{t('home.featured_desc')}</p>
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
              <h3>{t('home.no_products')}</h3>
              <p>{t('home.no_products_desc')}</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn-outline btn-lg">{t('home.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div className="container">
          <div className="section-heading">
            <h2>{t('home.why_title')}</h2>
            <div className="underline" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: '⚡', title: t('home.instant_title'), desc: t('home.instant_desc'), color: '#6C63FF' },
              { icon: '🔒', title: t('home.secure_title'),  desc: t('home.secure_desc'),  color: '#10B981' },
              { icon: '⭐', title: t('home.quality_title'), desc: t('home.quality_desc'), color: '#F59E0B' },
              { icon: '🇩🇪', title: t('home.german_title'), desc: t('home.german_desc'),  color: '#FF6584' },
            ].map(({ icon, title, desc, color }, i) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '2rem',
                textAlign: 'center', transition: 'all 0.3s',
                animation: `fadeInUp 0.5s ${0.1 + i * 0.1}s ease both`,
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.background  = `${color}08`;
                  e.currentTarget.style.transform   = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.background  = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform   = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: '0 auto 1.25rem',
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem',
                }}>
                  {icon}
                </div>
                <h4 style={{ color: '#F1F5F9', marginBottom: '0.6rem', fontSize: '1rem' }}>{title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{
        padding: '6rem 0', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(108,99,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Animated border top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #6C63FF, #FF6584, #6C63FF, transparent)',
          animation: 'shimmer 3s linear infinite',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.25)',
            borderRadius: 30, padding: '0.35rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.8rem', color: '#FF6584', fontWeight: 600,
          }}>
            🔥 Limited Time Offer
          </div>
          <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {t('home.cta_title')}
          </h2>
          <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
            {t('home.cta_desc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 700,
              fontSize: '1rem', color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(108,99,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,99,255,0.4)'; }}
            >
              {t('home.start_shopping')}
            </Link>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 600,
              fontSize: '1rem', color: '#94A3B8', textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              {t('home.join_free')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Animations ── */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes typeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-visual { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
