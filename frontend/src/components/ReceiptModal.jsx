import React from 'react';
import { X, Printer, CheckCircle, UtensilsCrossed } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '2rem' }}
        id="printable-receipt"
      >
        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UtensilsCrossed size={22} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--charcoal)' }}>
              Foodie<span style={{ color: 'var(--primary)' }}>Hub</span> Receipt
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div style={{
          backgroundColor: 'var(--bg-cream)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Order Number
            </span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--charcoal)' }}>{order.orderNumber}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Order Date & Time
            </span>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Payment Method & Status
            </span>
            <span style={{ fontWeight: 700, color: order.paymentStatus === 'Paid' ? 'var(--veg-color)' : 'var(--primary-dark)' }}>
              {order.paymentMethod} ({order.paymentStatus})
            </span>
            {order.gatewayPaymentId && (
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                Txn: {order.gatewayPaymentId}
              </span>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Restaurant Partner
            </span>
            <strong>{order.restaurantName || order.restaurantId?.name || 'Restaurant'}</strong>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Deliver To
          </span>
          <p style={{ fontWeight: 700, color: 'var(--charcoal)' }}>
            {order.deliveryAddress?.name} ({order.deliveryAddress?.phone})
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
          </p>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.5rem 0' }}>Item Description</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--charcoal)' }}>
                  {item.name}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>₹{item.price}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700 }}>
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: '0.875rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-color)',
          maxWidth: '280px',
          marginLeft: 'auto',
          marginBottom: '1.5rem',
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
            <span>Taxes & GST:</span>
            <span>₹{order.tax}</span>
          </div>
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--veg-color)', fontWeight: 600 }}>
              <span>Coupon Discount:</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid var(--charcoal)',
            paddingTop: '0.5rem',
            marginTop: '0.2rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--charcoal)',
          }}>
            <span>Total Paid:</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <p>Thank you for choosing FoodieHub. For support, write to support@foodiehub.demo</p>
          <p style={{ marginTop: '0.2rem' }}>This is an educational computer-generated invoice demonstration.</p>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-receipt, #printable-receipt * { visibility: visible; }
            #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
