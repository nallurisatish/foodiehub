import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, Clock, Bike, Home, XCircle, FileText } from 'lucide-react';
import api from '../services/api';
import ReceiptModal from '../components/ReceiptModal';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
      });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        comment: `Order status changed to ${newStatus} by platform administrator.`,
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving orders repository..." />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
          Customer Orders Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Monitor live restaurant orders, change delivery progress, and audit transaction payments
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
          <Search size={18} color="var(--primary)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order # or customer..."
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: statusFilter === st ? 'var(--charcoal)' : 'var(--bg-surface-alt)',
                color: statusFilter === st ? 'white' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface-alt)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Order Number</th>
              <th style={{ padding: '0.85rem 1rem' }}>Customer & Destination</th>
              <th style={{ padding: '0.85rem 1rem' }}>Items Snapshot</th>
              <th style={{ padding: '0.85rem 1rem' }}>Amount & Payment</th>
              <th style={{ padding: '0.85rem 1rem' }}>Live Order Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                      {order.orderNumber}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <strong style={{ color: 'var(--charcoal)', display: 'block' }}>
                      {order.deliveryAddress?.name || 'Customer'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {order.deliveryAddress?.city} • {order.deliveryAddress?.phone}
                    </span>
                  </td>

                  <td style={{ padding: '1rem', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.4', display: 'block' }}>
                      {order.items?.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                      from {order.restaurantName || order.restaurantId?.name}
                    </span>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--charcoal)', display: 'block' }}>
                      ₹{order.totalAmount}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: order.paymentStatus === 'Paid' ? 'var(--veg-color)' : '#b45309',
                    }}>
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id || ['Delivered', 'Cancelled'].includes(order.orderStatus)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor:
                          order.orderStatus === 'Delivered' ? '#dcfce7' :
                          order.orderStatus === 'Cancelled' ? '#fee2e2' : '#ffedd5',
                        color:
                          order.orderStatus === 'Delivered' ? '#15803d' :
                          order.orderStatus === 'Cancelled' ? '#b91c1c' : '#c2410c',
                        border: '1px solid var(--border-color)',
                        cursor: ['Delivered', 'Cancelled'].includes(order.orderStatus) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setActiveReceiptOrder(order)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <FileText size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}
    </div>
  );
}
