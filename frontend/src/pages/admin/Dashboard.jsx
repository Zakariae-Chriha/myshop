import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const StatCard = ({ icon, label, value, sub, color, trend }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '1.5rem',
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
    transition: 'all 0.3s', cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${color}40`;
      e.currentTarget.style.background  = `${color}08`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.background  = 'rgba(255,255,255,0.03)';
    }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
      background: `${color}20`,
      border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem',
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1, marginBottom: '0.25rem' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.75rem', color: '#334155' }}>{sub}</div>
      )}
    </div>
    {trend && (
      <div style={{
        fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px',
        borderRadius: 20, flexShrink: 0,
        background: trend > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: trend > 0 ? '#10B981' : '#EF4444',
      }}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/orders/admin/all?limit=5', { headers }).then(r => r.json()),
      fetch('http://localhost:5000/api/products?limit=100').then(r => r.json()),
    ]).then(([ordersData, productsData]) => {
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
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    pending:    { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
    processing: { bg: 'rgba(108,99,255,0.15)', color: '#A5B4FC' },
    shipped:    { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    delivered:  { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
    cancelled:  { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  };

  if (loading) return (
    <AdminLayout>
      <div className="spinner-wrap"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F1F5F9', marginBottom: '0.25rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Welcome back — here is what is happening in your shop
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          <StatCard icon="📦" label="Total Orders"   value={stats?.totalOrders || 0}                          color="#6C63FF" trend={12} />
          <StatCard icon="💶" label="Total Revenue"  value={`€${(stats?.totalRevenue || 0).toFixed(2)}`}      color="#10B981" sub="paid orders only" trend={8} />
          <StatCard icon="🛍️" label="Products"       value={stats?.totalProducts || 0}                        color="#F59E0B" />
          <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders || 0}                         color="#FF6584" sub="needs attention" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Recent orders */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#F1F5F9' }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: '#6C63FF' }}>
                View all →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#334155' }}>
                No orders yet
              </div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order._id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#A5B4FC', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.1rem' }}>
                      {order.customer?.name} · {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.875rem' }}>
                      €{order.total?.toFixed(2)}
                    </div>
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
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '1.5rem',
          }}>
            <h3 style={{ fontSize: '1rem', color: '#F1F5F9', marginBottom: '1.25rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { to: '/admin/products',   icon: '➕', label: 'Add New Product',    color: '#6C63FF' },
                { to: '/admin/orders',     icon: '📋', label: 'View All Orders',    color: '#10B981' },
                { to: '/admin/coupons',    icon: '🎟️', label: 'Create Coupon',      color: '#F59E0B' },
                { to: '/admin/categories', icon: '🗂️', label: 'Manage Categories',  color: '#FF6584' },
                { to: '/admin/customers',  icon: '👥', label: 'View Customers',     color: '#8B5CF6' },
                { to: '/admin/admins',     icon: '👑', label: 'Manage Admins',      color: '#EC4899' },
              ].map(({ to, icon, label, color }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1rem', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}40`;
                    e.currentTarget.style.background  = `${color}10`;
                    e.currentTarget.style.transform   = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform   = 'translateX(0)';
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}20`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>
                    {label}
                  </span>
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