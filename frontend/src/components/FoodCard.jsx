import React from 'react';
import { Plus, Minus, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, restaurant, onOpenModal }) {
  if (!food) return null;

  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.foodId === food._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(food, 1, restaurant);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(food._id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(food._id, quantity - 1);
  };

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(food)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      className="food-card"
    >
      {/* Food Image */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        <img
          src={food.image}
          alt={food.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          className="food-img"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Veg / Non-Veg Indicator */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
          <span className={food.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
        </div>

        {/* Bestseller Badge */}
        {food.bestseller && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'var(--charcoal)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
          }}>
            Bestseller
          </span>
        )}

        {!food.isAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--charcoal)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {food.name}
          </h4>

          {food.rating && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--star-gold)',
            }}>
              <Star size={13} fill="var(--star-gold)" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4',
          marginBottom: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {food.description}
        </p>

        {/* Meta / Prep Time & Restaurant */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--text-light)',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <Clock size={12} />
          <span>{food.preparationTime || '20 mins'}</span>
          <span>•</span>
          <span>{food.category}</span>
          {(restaurant?.name || (typeof food.restaurantId === 'object' && food.restaurantId?.name)) && (
            <>
              <span>•</span>
              <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                {restaurant?.name || food.restaurantId.name}
              </span>
            </>
          )}
        </div>

        {/* Bottom Row: Price & Quantity Action Button */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-light)',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--charcoal)' }}>
              ₹{food.price}
            </span>
          </div>

          {/* Add to Cart / Qty Stepper */}
          {food.isAvailable ? (
            quantity > 0 ? (
              <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAdd}
                style={{
                  fontWeight: 700,
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                ADD <Plus size={14} />
              </button>
            )
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
              Unavailable
            </span>
          )}
        </div>
      </div>

      <style>{`
        .food-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: rgba(249, 115, 22, 0.3);
        }
        .food-card:hover .food-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
