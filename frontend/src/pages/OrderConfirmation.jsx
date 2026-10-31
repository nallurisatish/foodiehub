import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  ArrowRight,
  UtensilsCrossed,
  Bike,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import ReceiptModal from '../components/ReceiptModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#16a34a', '#3b82f6', '#eab308'],
      });
    } catch {
      // Ignore if confetti not supported
    }

    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await orderService.getOrderById(id);
          if (res.success) {
            setOrder(res.order);
          }
        } catch (err) {
          console.error('Failed to load order confirmation:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, order]);

  if (loading) return <LoadingSpinner text="Retrieving your confirmed order details..." />;
  if (!order) {
    return (
      <div className="container section-padding" style={{ textAlign: 'center' }}>
        <h2>Order confirmation not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Celebration Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: 'var(--veg-bg)',
            color: 'var(--veg-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 4px 16px rgba(22, 163, 74, 0.25)',
          }}>
            <CheckCircle size={44} />
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--veg-color)',
            backgroundColor: '#dcfce7',
            padding: '0.2rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Order Confirmed & Placed
          </span>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--charcoal)', margin: '0.75rem 0 0.35rem' }}>
            Thank You for Your Order!
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.75rem' }}>
            Your meal from <strong style={{ color: 'var(--charcoal)' }}>{order.restaurantName || order.restaurantId?.name || 'Restaurant'}</strong> is being prepped fresh.
          </p>

          {/* Highlights Box */}
          <div style={{
            backgroundColor: 'var(--bg-cream)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginBottom: '2rem',
            border: '1px solid var(--border-color)',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Number</span>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{order.orderNumber}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Delivery</span>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={16} color="var(--primary)" /> {order.estimatedDeliveryTime || '35 mins'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</span>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--charcoal)' }}>₹{order.totalAmount}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: order.paymentStatus === 'Paid' ? 'var(--veg-color)' : 'var(--text-main)' }}>
                {order.paymentMethod} ({order.paymentStatus})
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to={`/orders/${order._id}`}
              className="btn btn-primary btn-lg"
              style={{ flex: '1 1 200px' }}
            >
              <Bike size={18} /> Live Order Tracking
            </Link>

            <button
              type="button"
              onClick={() => setShowReceipt(true)}
              className="btn btn-outline btn-lg"
              style={{ flex: '1 1 200px' }}
            >
              <FileText size={18} /> View / Print Receipt
            </button>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && (
          <ReceiptModal order={order} onClose={() => setShowReceipt(false)} />
        )}
      </div>
    </div>
  );
}
