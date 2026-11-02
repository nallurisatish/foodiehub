import React, { useState } from 'react';
import { Tag, Check, X, ShieldAlert, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CheckoutSummary({ onPlaceOrder, isSubmitting, paymentMethod }) {
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    coupon,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplying(true);
    setCouponMsg(null);

    const res = await applyCouponCode(couponInput.trim());
    setApplying(false);
    setCouponMsg({
      success: res.success,
      text: res.message,
    });

    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Restaurant Pickup Location Card */}
      {restaurant && (
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pickup Kitchen Location
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {restaurant?.distance || '2.4 km'} away
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            {restaurant?.name || 'Restaurant'}
          </h3>

          {restaurant.address && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <MapPin size={12} color="var(--primary)" style={{ display: 'inline', marginRight: '4px' }} />
              {restaurant.address.doorNo ? `${restaurant.address.doorNo}, ` : ''}{restaurant.address.street}
              {restaurant.address.landmark ? ` (Near ${restaurant.address.landmark})` : ''}, {restaurant.address.city} - {restaurant.address.pincode}
            </p>
          )}

          {restaurant.googleMapsUrl && (
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: 600,
                marginTop: '0.4rem',
                textDecoration: 'none',
              }}
            >
              <span>View Kitchen on Google Maps</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {/* Items List Snapshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {items.map((item) => (
          <div
            key={item.foodId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className={item.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
              <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>
                {item.quantity} × {item.name}
              </span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Coupon Application Box */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-cream)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        border: '1px dashed var(--primary)',
      }}>
        {coupon ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                  '{coupon.code}' Applied!
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--veg-color)' }}>
                  You saved ₹{discount} on this order.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              style={{ color: 'var(--nonveg-color)', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Try FOODIE50 or WELCOME20"
              style={{
                flexGrow: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                backgroundColor: 'white',
              }}
            />
            <button
              type="submit"
              disabled={applying || !couponInput.trim()}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {applying ? 'Checking...' : 'Apply'}
            </button>
          </form>
        )}

        {couponMsg && (
          <p style={{
            fontSize: '0.75rem',
            marginTop: '0.4rem',
            color: couponMsg.success ? 'var(--veg-color)' : 'var(--nonveg-color)',
            fontWeight: 600,
          }}>
            {couponMsg.text}
          </p>
        )}
      </div>

      {/* Itemized Bill Calculations */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.875rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Item Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Delivery Partner Fee</span>
          <span style={{ color: deliveryFee === 0 ? 'var(--veg-color)' : 'inherit', fontWeight: deliveryFee === 0 ? 700 : 400 }}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Govt Taxes & GST (5%)</span>
          <span>₹{tax}</span>
        </div>

        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--veg-color)', fontWeight: 600 }}>
            <span>Coupon Discount</span>
            <span>- ₹{discount}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
            To Pay
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            ₹{grandTotal}
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Inclusive of all taxes
        </span>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={isSubmitting || items.length === 0}
        className="btn btn-primary btn-lg"
        style={{
          width: '100%',
          fontWeight: 700,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting
          ? 'Processing Order...'
          : paymentMethod === 'Razorpay'
          ? `Pay ₹${grandTotal} Securely`
          : `Place COD Order (₹${grandTotal})`}
      </button>
    </div>
  );
}
