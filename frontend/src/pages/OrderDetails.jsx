import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  FileText,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import OrderTracker from '../components/OrderTracker';
import LiveDeliveryMap from '../components/LiveDeliveryMap';
import ReceiptModal from '../components/ReceiptModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrderDetails = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Auto-refresh poll every 15 seconds for ongoing orders
    const timer = setInterval(() => {
      if (order && !['Delivered', 'Cancelled'].includes(order.orderStatus)) {
        fetchOrderDetails();
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');

    try {
      const res = await orderService.cancelOrder(
        order._id,
        cancelReason || 'Customer requested cancellation'
      );
      if (res.success) {
        setOrder(res.order);
        setShowCancelModal(false);
      } else {
        setCancelError(res.message || 'Could not cancel order.');
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving live order tracking..." />;
  if (!order) {
    return (
      <div className="container section-padding" style={{ textAlign: 'center' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const isEligibleForCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="section-padding" style={{ minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Back Link & Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
                Order #{order.orderNumber}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setShowReceipt(true)}
                className="btn btn-outline btn-sm"
              >
                <FileText size={15} /> Receipt
              </button>

              {isEligibleForCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#fca5a5', color: 'var(--nonveg-color)' }}
                >
                  <XCircle size={15} /> Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1. Live Visual Stepper */}
        <div style={{ marginBottom: '1.5rem' }}>
          <OrderTracker
            orderStatus={order.orderStatus}
            statusHistory={order.statusHistory}
            onRefresh={() => fetchOrderDetails(true)}
            isRefreshing={refreshing}
          />
        </div>

        {/* 2. Interactive Real-Time Rider Route & Arrival Map */}
        {order.orderStatus !== 'Cancelled' && (
          <LiveDeliveryMap
            order={order}
            onOrderUpdated={(updated) => setOrder(updated)}
          />
        )}

        {/* 2. Restaurant & Delivery Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Restaurant Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Restaurant Kitchen Partner
                </span>
                {order.restaurantAddress?.locality && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-dark)', backgroundColor: 'var(--primary-light)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                    📍 {order.restaurantAddress.locality}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)', margin: '0.2rem 0' }}>
                {order.restaurantName || order.restaurantId?.name || 'Restaurant Partner'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                {order.restaurantAddress?.doorNo ? `${order.restaurantAddress.doorNo}, ` : ''}
                {order.restaurantAddress?.street || order.restaurantId?.address?.street || 'Main Road'}
                {order.restaurantAddress?.landmark ? ` (Near ${order.restaurantAddress.landmark})` : ''}{order.restaurantAddress?.city ? `, ${order.restaurantAddress.city}` : ''}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
                Estimated preparation: {order.estimatedDeliveryTime || '30-40 mins'}
              </p>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(order.restaurantAddress?.googleMapsUrl || order.restaurantId?.googleMapsUrl) && (
                <a
                  href={order.restaurantAddress?.googleMapsUrl || order.restaurantId?.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <MapPin size={12} />
                  <span>View on Google Maps</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Delivery Destination
            </span>
            <p style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem', margin: '0.3rem 0' }}>
              {order.deliveryAddress?.name} ({order.deliveryAddress?.phone})
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </p>
            {order.deliveryInstructions && (
              <p style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                Note: "{order.deliveryInstructions}"
              </p>
            )}
          </div>
        </div>

        {/* 3. Items Ordered Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1rem' }}>
            Items in this order
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={item.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
                  <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>
                    {item.name} × {item.quantity}
                  </span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.875rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            maxWidth: '300px',
            marginLeft: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Taxes (5% GST):</span>
              <span>₹{order.tax}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--veg-color)', fontWeight: 600 }}>
                <span>Coupon ({order.couponCode}):</span>
                <span>- ₹{order.discount}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid var(--charcoal)',
              paddingTop: '0.4rem',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--charcoal)',
            }}>
              <span>Total Paid:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '440px', padding: '1.75rem' }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
                Cancel Order #{order.orderNumber}?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Please tell us the reason for cancelling this order so we can improve our kitchen partner coordination:
              </p>

              {cancelError && (
                <p style={{ color: 'var(--nonveg-color)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {cancelError}
                </p>
              )}

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, ordered by mistake, will reorder later..."
                rows={3}
                className="form-input"
                style={{ marginBottom: '1.25rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="btn"
                  style={{ flex: 1, backgroundColor: 'var(--nonveg-color)', color: 'white' }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <ReceiptModal order={order} onClose={() => setShowReceipt(false)} />
        )}
      </div>
    </div>
  );
}
