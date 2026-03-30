import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '1.5rem',
    border: '1px solid #F3F4F6', display: 'flex', gap: '1rem', alignItems: 'flex-start',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: color + '20',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem',
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2937', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [sellers, setSellers] = useState([]);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:5000/api/orders/admin/all?limit=5', { headers }).then(r => r.json()),
      fetch('http://localhost:5000/api/products?sort=bestseller&limit=5').then(r => r.json()),
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData.orders || []);
      setSellers(productsData.products || []);

      const totalRevenue = (ordersData.orders || [])
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalOrders:   ordersData.total || 0,
        totalRevenue,
        totalProducts: productsData.pagination?.total || 0,
      });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="spinner-wrap"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="📦" label="Total Orders"   value={stats?.totalOrders || 0}                           color="#6C63FF" />
          <StatCard icon="💶" label="Total Revenue"  value={`€${(stats?.totalRevenue || 0).toFixed(2)}`}       color="#10B981" sub="paid orders only" />
          <StatCard icon="🛍️" label="Products"       value={stats?.totalProducts || 0}                         color="#F59E0B" />
          <StatCard icon="⭐" label="Avg Rating"     value="4.8"                                               color="#FF6584" sub="based on reviews" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Recent orders */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem' }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: '#6C63FF' }}>View all</Link>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No orders yet</p>
            ) : (
              orders.map(order => (
                <div key={order._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid #F9FAFB', fontSize: '0.875rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#6C63FF' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {order.customer?.name || 'Customer'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>€{order.total?.toFixed(2)}</div>
                    <span style={{
                      fontSize: '0.7rem', padding: '1px 7px', borderRadius: 20, fontWeight: 600,
                      background: order.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7',
                      color:      order.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                    }}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Best sellers */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem' }}>Top Products</h3>
              <Link to="/admin/products" style={{ fontSize: '0.8rem', color: '#6C63FF' }}>View all</Link>
            </div>
            {sellers.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No products yet</p>
            ) : (
              sellers.map((product, i) => (
                <div key={product._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0', borderBottom: '1px solid #F9FAFB',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #EEF0FF, #C7D2FE)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: '#6C63FF', flexShrink: 0,
                  }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name?.en || product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {product.totalSold} sold
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6C63FF', flexShrink: 0 }}>
                    €{product.priceWithVAT?.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;