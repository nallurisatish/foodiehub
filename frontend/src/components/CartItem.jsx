import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  if (!item) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border-light)',
    }}>
      {/* Left Details: Image, Veg Badge, Name, Unit Price */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: '1 1 auto' }}>
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              flexShrink: 0,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span className={item.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--charcoal)',
            }}>
              {item.name}
            </h4>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ₹{item.price} each
          </span>
        </div>
      </div>

      {/* Right Controls: Stepper, Line Total, Trash Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div className="qty-stepper">
          <button
            type="button"
            className="qty-btn"
            onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="qty-val">{item.quantity}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        <div style={{ minWidth: '70px', textAlign: 'right' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--charcoal)' }}>
            ₹{item.price * item.quantity}
          </span>
        </div>

        <button
          type="button"
          onClick={() => removeFromCart(item.foodId)}
          style={{
            color: 'var(--text-light)',
            padding: '4px',
            borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
          title="Remove from cart"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
