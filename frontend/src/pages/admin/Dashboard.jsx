import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, trend }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '1.5rem',
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
    transition: 'all 0.3s', cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
      background: `${color}20`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#334155' }}>{sub}</div>}
    </div>
    {trend !== undefined && (
      <div style={{
        fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
        background: trend > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: trend > 0 ? '#10B981' : '#EF4444',
      }}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// ─── Bar Chart (SVG) ─────────────────────────────────────────────────────────
const BarChart = ({ data, valueKey, color, label, prefix = '' }) => {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const W = 100, H = 80, barW = W / data.length * 0.55, gap = W / data.length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barH  = (d[valueKey] / max) * (H - 18);
          const x     = i * gap + (gap - barW) / 2;
          const y     = H - barH - 14;
          const isHov = hovered === i;
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width={barW} height={barH}
                rx={2}
                fill={isHov ? color : `url(#grad-${valueKey})`}
                opacity={isHov ? 1 : 0.85}
              />
              {isHov && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle"
                  fill="#F1F5F9" fontSize="4.5" fontWeight="bold">
                  {prefix}{typeof d[valueKey] === 'number' ? d[valueKey].toFixed(valueKey === 'revenue' ? 0 : 0) : d[valueKey]}
                </text>
              )}
              <text x={x + barW / 2} y={H - 2} textAnchor="middle"
                fill="#475569" fontSize="3.8">
                {d.date?.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
};

// ─── Donut Chart (SVG) ───────────────────────────────────────────────────────
const DonutChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const colors = { pending: '#F59E0B', processing: '#6C63FF', shipped: '#3B82F6', delivered: '#10B981', cancelled: '#EF4444' };
  const total  = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 28, cx = 40, cy = 40, stroke = 12;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const arcs = data.map(d => {
    const dash  = (d.count / total) * circumference;
    const gap   = circumference - dash;
    const start = offset;
    offset += dash;
    return { ...d, dash, gap, start };
  });

  const hoveredItem = hovered !== null ? data[hovered] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg viewBox="0 0 80 80" style={{ width: 120, height: 120 }}>
          {arcs.map((arc, i) => (
            <circle key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={colors[arc._id] || '#475569'}
              strokeWidth={hovered === i ? stroke + 2 : stroke}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.start}
              strokeLinecap="round"
              style={{ cursor: 'pointer', transition: 'stroke-width 0.2s', transformOrigin: `${cx}px ${cy}px` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#F1F5F9" fontSize="10" fontWeight="bold">
            {hoveredItem ? hoveredItem.count : total}
          </text>
          <text x={cx} y={cy + 7} textAnchor="middle" fill="#475569" fontSize="5">
            {hoveredItem ? hoveredItem._id : 'total'}
          </text>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.3rem 0.6rem', borderRadius: 6,
            background: hovered === i ? `${colors[d._id] || '#475569'}15` : 'transparent',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[d._id] || '#475569', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'capitalize' }}>{d._id}</span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colors[d._id] || '#94A3B8' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats,     setStats]     = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${BASE_URL}/api/orders/admin/all?limit=5`,    { headers }).then(r => r.json()),
      fetch(`${BASE_URL}/api/products?limit=100`).then(r => r.json()),
      fetch(`${BASE_URL}/api/orders/admin/analytics`,      { headers }).then(r => r.json()),
    ]).then(([ordersData, productsData, analyticsData]) => {
      const allOrders     = ordersData.orders || [];
      const paidOrders    = allOrders.filter(o => o.paymentStatus === 'paid');
      const totalRevenue  = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending').length;

      setOrders(allOrders);
      setStats({
        totalOrders:   ordersData.total || 0,
        totalRevenue,
        totalProducts: productsData.pagination?.total || 0,
        pendingOrders,
      });
      setAnalytics(analyticsData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    pending:    { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
    processing: { bg: 'rgba(108,99,255,0.15)',  color: '#A5B4FC' },
    shipped:    { bg: 'rgba(59,130,246,0.15)',  color: '#60A5FA' },
    delivered:  { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
    cancelled:  { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  };

  if (loading) return (
    <AdminLayout>
      <div className="spinner-wrap"><div className="spinner" /></div>
    </AdminLayout>
  );

  const card = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '1.5rem',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>Welcome back — here is what is happening in your shop</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="📦" label="Total Orders"   value={stats?.totalOrders || 0}                     color="#6C63FF" trend={12} />
          <StatCard icon="💶" label="Total Revenue"  value={`€${(stats?.totalRevenue || 0).toFixed(2)}`} color="#10B981" sub="paid orders only" trend={8} />
          <StatCard icon="🛍️" label="Products"       value={stats?.totalProducts || 0}                   color="#F59E0B" />
          <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders || 0}                   color="#FF6584" sub="needs attention" />
        </div>

        {/* Charts row */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* Revenue chart */}
            <div style={card}>
              <h3 style={{ fontSize: '0.95rem', color: '#F1F5F9', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Revenue — last 7 days</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>
                  €{analytics.daily.reduce((s, d) => s + d.revenue, 0).toFixed(0)}
                </span>
              </h3>
              <BarChart data={analytics.daily} valueKey="revenue" color="#10B981" label="Hover a bar to see exact value" prefix="€" />
            </div>

            {/* Orders chart */}
            <div style={card}>
              <h3 style={{ fontSize: '0.95rem', color: '#F1F5F9', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Orders — last 7 days</span>
                <span style={{ color: '#6C63FF', fontWeight: 800 }}>
                  {analytics.daily.reduce((s, d) => s + d.orders, 0)} orders
                </span>
              </h3>
              <BarChart data={analytics.daily} valueKey="orders" color="#6C63FF" label="Hover a bar to see exact value" />
            </div>

            {/* Status breakdown */}
            <div style={card}>
              <h3 style={{ fontSize: '0.95rem', color: '#F1F5F9', marginBottom: '1.25rem' }}>Order Status Breakdown</h3>
              {analytics.statusBreakdown?.length > 0
                ? <DonutChart data={analytics.statusBreakdown} />
                : <p style={{ color: '#475569', fontSize: '0.85rem' }}>No orders yet</p>}
            </div>

            {/* Top products */}
            <div style={card}>
              <h3 style={{ fontSize: '0.95rem', color: '#F1F5F9', marginBottom: '1.25rem' }}>Top Products by Revenue</h3>
              {analytics.topProducts?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {analytics.topProducts.map((p, i) => {
                    const maxRev = analytics.topProducts[0]?.revenue || 1;
                    const pct    = (p.revenue / maxRev) * 100;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', flex: 1, marginRight: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {i + 1}. {p._id}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#A5B4FC', fontWeight: 700, flexShrink: 0 }}>
                            €{p.revenue.toFixed(0)} · {p.totalSold} sold
                          </span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: 'linear-gradient(90deg, #6C63FF, #8B5CF6)', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>No sales data yet</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Recent orders */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#F1F5F9' }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: '#6C63FF' }}>View all →</Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#334155' }}>No orders yet</div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#A5B4FC', fontSize: '0.875rem', fontFamily: 'monospace' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.1rem' }}>
                      {order.customer?.name} · {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.875rem' }}>€{order.total?.toFixed(2)}</div>
                    <span style={{
                      fontSize: '0.68rem', padding: '1px 8px', borderRadius: 20, fontWeight: 600,
                      background: statusColors[order.orderStatus]?.bg || 'rgba(255,255,255,0.05)',
                      color: statusColors[order.orderStatus]?.color || '#475569',
                    }}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick actions */}
          <div style={card}>
            <h3 style={{ fontSize: '1rem', color: '#F1F5F9', marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { to: '/admin/products',   icon: '➕', label: 'Add New Product',   color: '#6C63FF' },
                { to: '/admin/orders',     icon: '📋', label: 'View All Orders',   color: '#10B981' },
                { to: '/admin/coupons',    icon: '🎟️', label: 'Create Coupon',     color: '#F59E0B' },
                { to: '/admin/categories', icon: '🗂️', label: 'Manage Categories', color: '#FF6584' },
                { to: '/admin/customers',  icon: '👥', label: 'View Customers',    color: '#8B5CF6' },
                { to: '/admin/admins',     icon: '👑', label: 'Manage Admins',     color: '#EC4899' },
              ].map(({ to, icon, label, color }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1rem', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>{label}</span>
                  <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '0.875rem' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
