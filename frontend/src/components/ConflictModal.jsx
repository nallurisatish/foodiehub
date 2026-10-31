import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ConflictModal() {
  const { conflictModal, setConflictModal, addToCart } = useCart();

  if (!conflictModal.isOpen) return null;

  const { newFood, newRestaurant } = conflictModal;

  const handleDiscardAndAdd = () => {
    addToCart(newFood, 1, newRestaurant, true);
  };

  const handleCancel = () => {
    setConflictModal({ isOpen: false, newFood: null, newRestaurant: null });
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '1.75rem', textAlign: 'center' }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <AlertCircle size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.6rem' }}>
          Replace Cart Items?
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
          Your cart currently contains items from another restaurant. FoodieHub allows ordering from one restaurant at a time to ensure optimal fresh delivery.
          <br /><br />
          Would you like to reset your cart to add <strong>{newFood?.name}</strong> from <strong>{newRestaurant?.name}</strong>?
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Keep Current
          </button>
          <button
            type="button"
            onClick={handleDiscardAndAdd}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Reset & Add
          </button>
        </div>
      </div>
    </div>
  );
}
