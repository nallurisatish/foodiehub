import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  FileText,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Bike,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import ReceiptModal from '../components/ReceiptModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#b91c1c' };
      case 'Out for Delivery':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'Preparing':
      case 'Confirmed':
        return { bg: '#ffedd5', text: '#c2410c' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving your past orders..." />;

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.3rem' }}>
            My Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Review past meals, track ongoing deliveries, and download receipts
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
              No orders placed yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Hungry? Browse our top restaurants and place your very first order!
            </p>
            <Link to="/restaurants" className="btn btn-primary btn-md">
              <UtensilsCrossed size={16} /> Order Delicious Food
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.orderStatus);

              return (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Card Header: Restaurant, Date & Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
                        {order.restaurantName || order.restaurantId?.name || 'Restaurant'}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      padding: '0.35rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}>
                      {order.orderStatus === 'Delivered' && <CheckCircle2 size={13} />}
                      {order.orderStatus === 'Cancelled' && <XCircle size={13} />}
                      {order.orderStatus === 'Out for Delivery' && <Bike size={13} />}
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Items Summary */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                    </p>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</span>
                      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                        ₹{order.totalAmount}{' '}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                          via {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => setActiveReceiptOrder(order)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FileText size={14} /> Receipt
                      </button>

                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        Track Order <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Receipt Modal */}
        {activeReceiptOrder && (
          <ReceiptModal
            order={activeReceiptOrder}
            onClose={() => setActiveReceiptOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
