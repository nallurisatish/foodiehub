import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    coupon,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    setApplying(true);
    setCouponMsg(null);

    const res = await applyCouponCode(code.trim());
    setApplying(false);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) setCouponCode('');
  };

  if (items.length === 0) {
    return (
      <div className="section-padding" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '520px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <ShoppingBag size={44} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.6rem' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Good food is always cooking! Go ahead and explore delicious dishes from our top local restaurants.
          </p>

          <Link to="/restaurants" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-full)' }}>
            <UtensilsCrossed size={18} /> Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Title & Clear Cart Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
              Your Food Cart
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              From <strong style={{ color: 'var(--charcoal)' }}>{restaurant?.name || 'Restaurant'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--nonveg-color)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        {/* 2-Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}>
          {/* Left Column: Items List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--charcoal)' }}>
              Ordered Items
            </h3>

            <div>
              {items.map((item) => (
                <CartItem key={item.foodId} item={item} />
              ))}
            </div>

            {/* Quick Available Promo Badges */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                Available Coupons (Tap to Apply)
              </span>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {['FOODIE50', 'WELCOME20', 'FREEDEL'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyCoupon(code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px dashed var(--primary)',
                      color: 'var(--primary-dark)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <Tag size={13} /> {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Bill Details Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--charcoal)' }}>
              Bill Details
            </h3>

            {/* Promo Code Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              {coupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--veg-color)" />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--veg-color)' }}>
                      '{coupon.code}' Applied (-₹{discount})
                    </span>
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    style={{
                      flexGrow: 1,
                      padding: '0.6rem 0.85rem',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {applying ? 'Applying...' : 'Apply'}
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

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Item Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>₹{subtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--veg-color)' : 'var(--charcoal)', fontWeight: 600 }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Govt Taxes (5% GST)</span>
                <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>₹{tax}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--veg-color)', fontWeight: 700 }}>
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
              paddingTop: '1rem',
              borderTop: '2px solid var(--charcoal)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                To Pay
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{grandTotal}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 700 }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              <ShieldCheck size={14} color="var(--veg-color)" />
              <span>Safe and contactless delivery assured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
