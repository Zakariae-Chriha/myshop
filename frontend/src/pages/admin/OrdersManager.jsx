import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const OrdersManager = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [selected, setSelected] = useState(null);
  const [tracking, setTracking] = useState({ trackingNumber: '', trackingCarrier: '' });
  const [updating, setUpdating] = useState(false);
  const [msg,      setMsg]      = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchOrders = () => {
    const url = filter
      ? `http://localhost:5000/api/orders/admin/all?status=${filter}`
      : 'http://localhost:5000/api/orders/admin/all';
    fetch(url, { headers })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, orderStatus, paymentStatus) => {
    setUpdating(true);
    try {
      await fetch(`http://localhost:5000/api/orders/admin/${id}/status`, {
        method: 'PUT', headers,
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      setMsg('Status updated!');
      fetchOrders();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error updating status'); }
    finally { setUpdating(false); }
  };

  const addTracking = async (id) => {
    setUpdating(true);
    try {
      await fetch(`http://localhost:5000/api/orders/admin/${id}/tracking`, {
        method: 'PUT', headers,
        body: JSON.stringify(tracking),
      });
      setMsg('Tracking added!');
      setSelected(null);
      setTracking({ trackingNumber: '', trackingCarrier: '' });
      fetchOrders();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error adding tracking'); }
    finally { setUpdating(false); }
  };

  const statusColors = {
    pending:    { bg: '#FEF3C7', color: '#92400E' },
    processing: { bg: '#EEF0FF', color: '#3C3489' },
    shipped:    { bg: '#D1FAE5', color: '#065F46' },
    delivered:  { bg: '#D1FAE5', color: '#065F46' },
    cancelled:  { bg: '#FEE2E2', color: '#991B1B' },
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Orders</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem',
                fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
                background:   filter === s ? '#6C63FF' : '#fff',
                color:        filter === s ? '#fff'    : '#374151',
                borderColor:  filter === s ? '#6C63FF' : '#D1D5DB',
              }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {msg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{msg}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="icon">📦</div><h3>No orders found</h3></div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#6C63FF', fontFamily: 'monospace' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(order.createdAt).toLocaleDateString('de-DE')}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{order.customer?.email}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#6C63FF' }}>
                      €{order.total?.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: order.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7',
                        color:      order.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                      }}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentMethod === 'cash_on_delivery' && order.paymentStatus !== 'paid' && (
                        <button onClick={() => updateStatus(order._id, order.orderStatus, 'paid')}
                          style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.7rem', color: '#6C63FF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                          Mark as paid
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={order.orderStatus}
                        onChange={e => updateStatus(order._id, e.target.value, order.paymentStatus)}
                        style={{
                          padding: '4px 8px', borderRadius: 8, fontSize: '0.8rem',
                          border: '1.5px solid #E5E7EB', cursor: 'pointer',
                          background: statusColors[order.orderStatus]?.bg,
                          color: statusColors[order.orderStatus]?.color,
                          fontWeight: 600,
                        }}
                      >
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => setSelected(order._id === selected ? null : order._id)}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem',
                          background: '#EEF0FF', color: '#6C63FF', border: 'none', cursor: 'pointer',
                          fontWeight: 500,
                        }}>
                        {order.trackingNumber ? '✓ Tracking' : '+ Tracking'}
                      </button>

                      {selected === order._id && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <input
                            placeholder="Tracking number"
                            value={tracking.trackingNumber}
                            onChange={e => setTracking({ ...tracking, trackingNumber: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.8rem', width: 150 }}
                          />
                          <input
                            placeholder="Carrier (DHL, UPS...)"
                            value={tracking.trackingCarrier}
                            onChange={e => setTracking({ ...tracking, trackingCarrier: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: '0.8rem', width: 150 }}
                          />
                          <button onClick={() => addTracking(order._id)} disabled={updating}
                            style={{ padding: '4px 8px', borderRadius: 6, background: '#6C63FF', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Save
                          </button>
                        </div>
                      )}
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

export default OrdersManager;