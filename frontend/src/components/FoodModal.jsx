import React, { useState } from 'react';
import { X, Star, Clock, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodModal({ food, restaurant, onClose }) {
  if (!food) return null;

  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(food, qty, restaurant);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Image */}
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img
            src={food.image}
            alt={food.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: '12px', left: '16px' }}>
            <span className={food.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
                {food.name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {food.category} • {food.preparationTime || '20 mins'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                ₹{food.price}
              </span>
            </div>
          </div>

          {/* Rating & Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {food.rating && (
              <div className="rating-pill">
                <Star size={12} fill="white" color="white" />
                <span>{food.rating.toFixed(1)}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>({food.ratingCount || 45})</span>
              </div>
            )}

            {food.tags && food.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {food.description}
          </p>

          {/* Quantity Selector & Add Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            <div className="qty-stepper" style={{ height: '42px' }}>
              <button
                type="button"
                className="qty-btn"
                style={{ width: '40px', height: '40px' }}
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="qty-val" style={{ minWidth: '36px', fontSize: '1.1rem' }}>{qty}</span>
              <button
                type="button"
                className="qty-btn"
                style={{ width: '40px', height: '40px' }}
                onClick={() => setQty(qty + 1)}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={added || !food.isAvailable}
              className="btn btn-primary"
              style={{
                flexGrow: 1,
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {added ? (
                <>
                  <Check size={18} /> Added to Cart!
                </>
              ) : (
                `Add to Cart • ₹${food.price * qty}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
