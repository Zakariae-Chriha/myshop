import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import BASE_URL from '../../api/config';

const OrdersManager = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [selected, setSelected] = useState(null);
  const [tracking, setTracking] = useState({ trackingNumber: '', trackingCarrier: '' });
  const [updating, setUpdating] = useState(false);
  const [msg,      setMsg]      = useState('');
  const [msgType,  setMsgType]  = useState('success');

  const token   = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const fetchOrders = () => {
    const url = filter
      ? `${BASE_URL}/api/orders/admin/all?status=${filter}`
      : `${BASE_URL}/api/orders/admin/all`;
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
      const res  = await fetch(`${BASE_URL}/api/orders/admin/${id}/status`, {
        method: 'PUT', headers,
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (orderStatus === 'delivered') {
        showMsg('Order marked as delivered — payment automatically set to Paid!');
      } else {
        showMsg('Status updated!');
      }
      fetchOrders();
    } catch (err) {
      showMsg(err.message || 'Error updating status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const addTracking = async (id) => {
    setUpdating(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/orders/admin/${id}/tracking`, {
        method: 'PUT', headers,
        body: JSON.stringify(tracking),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMsg('Tracking number saved!');
      setSelected(null);
      setTracking({ trackingNumber: '', trackingCarrier: '' });
      fetchOrders();
    } catch (err) {
      showMsg(err.message || 'Error adding tracking', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statusConfig = {
    pending:    { bg: 'rgba(251,191,36,0.15)',  color: '#FCD34D', label: 'Pending'    },
    processing: { bg: 'rgba(108,99,255,0.15)',  color: '#A5B4FC', label: 'Processing' },
    shipped:    { bg: 'rgba(52,211,153,0.15)',  color: '#6EE7B7', label: 'Shipped'    },
    delivered:  { bg: 'rgba(52,211,153,0.2)',   color: '#34D399', label: 'Delivered'  },
    cancelled:  { bg: 'rgba(248,113,113,0.15)', color: '#FCA5A5', label: 'Cancelled'  },
  };

  const thCell  = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' };
  const tdCell  = { padding: '0.9rem 1rem', verticalAlign: 'top' };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', background: 'var(--bg-primary)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F1F5F9' }}>Orders</h1>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.15rem' }}>Manage and track customer orders</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.78rem',
                fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${filter === s ? '#6C63FF' : 'rgba(255,255,255,0.1)'}`,
                background: filter === s ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.03)',
                color: filter === s ? '#A5B4FC' : '#64748B',
                transition: 'all 0.2s',
              }}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 10,
            background: msgType === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${msgType === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            color: msgType === 'success' ? '#6EE7B7' : '#FCA5A5',
            fontSize: '0.875rem', fontWeight: 500,
          }}>
            {msgType === 'success' ? '✓ ' : '✗ '}{msg}
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No orders found</h3>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thCell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const isCOD       = order.paymentMethod === 'cash_on_delivery';
                  const isDelivered = order.orderStatus  === 'delivered';
                  const isPaid      = order.paymentStatus === 'paid';
                  const canDeliver  = isCOD && !isDelivered && order.orderStatus !== 'cancelled';

                  return (
                    <tr key={order._id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>

                      {/* Order number */}
                      <td style={tdCell}>
                        <div style={{ fontWeight: 700, color: '#A5B4FC', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        {isCOD && (
                          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px', display: 'inline-block' }}>
                            COD
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td style={tdCell}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#E2E8F0' }}>{order.customer?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>{order.customer?.email}</div>
                      </td>

                      {/* Items */}
                      <td style={{ ...tdCell, fontSize: '0.875rem', color: '#94A3B8' }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </td>

                      {/* Total */}
                      <td style={{ ...tdCell, fontWeight: 700, color: '#A5B4FC' }}>
                        €{order.total?.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td style={tdCell}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                          background: isPaid ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                          color:      isPaid ? '#34D399'              : '#FCD34D',
                        }}>
                          {order.paymentStatus}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '0.3rem' }}>
                          {isCOD ? 'Cash on delivery' : 'Stripe'}
                        </div>
                      </td>

                      {/* Status dropdown */}
                      <td style={tdCell}>
                        <select
                          value={order.orderStatus}
                          onChange={e => updateStatus(order._id, e.target.value, order.paymentStatus)}
                          disabled={updating}
                          style={{
                            padding: '4px 8px', borderRadius: 8, fontSize: '0.78rem',
                            border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                            background: statusConfig[order.orderStatus]?.bg || 'rgba(255,255,255,0.05)',
                            color: statusConfig[order.orderStatus]?.color || '#94A3B8',
                            fontWeight: 600,
                          }}
                        >
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s} style={{ background: '#1E1B4B', color: '#F1F5F9' }}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={tdCell}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

                          {/* Mark as Delivered button — COD only, not yet delivered */}
                          {canDeliver && (
                            <button
                              onClick={() => updateStatus(order._id, 'delivered', 'paid')}
                              disabled={updating}
                              style={{
                                padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
                                background: 'linear-gradient(135deg, #34D399, #10B981)',
                                color: '#fff', border: 'none', cursor: 'pointer',
                                fontWeight: 600, whiteSpace: 'nowrap',
                              }}>
                              ✓ Mark Delivered
                            </button>
                          )}

                          {/* Delivered badge */}
                          {isDelivered && (
                            <div style={{
                              padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.75rem',
                              background: 'rgba(52,211,153,0.1)', color: '#34D399',
                              border: '1px solid rgba(52,211,153,0.2)', fontWeight: 600,
                            }}>
                              ✓ Delivered
                            </div>
                          )}

                          {/* Tracking button */}
                          <button
                            onClick={() => setSelected(order._id === selected ? null : order._id)}
                            style={{
                              padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.78rem',
                              background: 'rgba(108,99,255,0.12)', color: '#A5B4FC',
                              border: '1px solid rgba(108,99,255,0.2)', cursor: 'pointer',
                              fontWeight: 500,
                            }}>
                            {order.trackingNumber ? '✓ Tracking' : '+ Tracking'}
                          </button>

                          {/* Tracking inputs */}
                          {selected === order._id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
                              <input
                                placeholder="Tracking number"
                                value={tracking.trackingNumber}
                                onChange={e => setTracking({ ...tracking, trackingNumber: e.target.value })}
                                style={{
                                  padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', width: 160,
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#F1F5F9',
                                }}
                              />
                              <input
                                placeholder="Carrier (DHL, UPS...)"
                                value={tracking.trackingCarrier}
                                onChange={e => setTracking({ ...tracking, trackingCarrier: e.target.value })}
                                style={{
                                  padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', width: 160,
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#F1F5F9',
                                }}
                              />
                              <button onClick={() => addTracking(order._id)} disabled={updating}
                                style={{
                                  padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem',
                                  background: '#6C63FF', color: '#fff', border: 'none', cursor: 'pointer',
                                }}>
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersManager;
