import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike, MapPin, Tag } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

export default function RestaurantCard({ restaurant }) {
  if (!restaurant || typeof restaurant !== 'object') return null;

  const { currentLocation, getLocalizedRestaurant, getRestaurantDeliveryMetrics } = useLocationContext();
  const localized = getLocalizedRestaurant(restaurant) || restaurant || {};
  const metrics = getRestaurantDeliveryMetrics(restaurant) || {
    time: '20-25 min',
    distance: '1.5 km',
    fee: 0,
  };

  const {
    _id = 'default_id',
    name = 'Foodie Restaurant',
    cuisineTypes = [],
    image,
    rating = 4.5,
    isOpen = true,
    priceForTwo = 450,
    address = {},
    featured = false,
  } = localized;

  // Swiggy style contextual offers based on restaurant
  const offerText = featured ? '50% OFF UP TO ₹150' : 'FLAT ₹40 OFF • FREEDEL';

  return (
    <Link
      to={`/restaurants/${_id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.25s ease',
        position: 'relative',
        textDecoration: 'none',
      }}
      className="restaurant-card"
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden' }}>
        <img
          src={image}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="card-img"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient shadow for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Swiggy Style Promoted / Featured Badge */}
        {featured && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#1e293b',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            Promoted
          </span>
        )}

        {/* Swiggy Style Flat Offer Banner on Image */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: 'white',
          fontWeight: 800,
          fontSize: '0.85rem',
          letterSpacing: '-0.2px',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>
          <Tag size={13} color="#f97316" fill="#f97316" />
          <span>{offerText}</span>
        </div>

        {/* Closed Overlay if not open */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}>
            Currently Closed
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Name & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--charcoal)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
          }}>
            {name}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            backgroundColor: rating >= 4.5 ? '#15803d' : '#22c55e',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '6px',
            flexShrink: 0,
          }}>
            <Star size={11} fill="white" color="white" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Delivery Time & Dynamic Distance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--charcoal)',
          marginBottom: '0.4rem',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} color="var(--primary)" />
            {metrics?.time || '20-25 min'}
          </span>
          <span>•</span>
          <span>{metrics?.distance || '1.5 km'} away</span>
        </div>

        {/* Cuisines */}
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: '0 0 0.5rem 0',
        }}>
          {Array.isArray(cuisineTypes) ? cuisineTypes.join(', ') : cuisineTypes}
        </p>

        {/* Real-Life Physical Location & Landmark */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-light)',
          marginBottom: '0.75rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 700,
            color: 'var(--primary-dark)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
          }}>
            <MapPin size={11} />
            {address?.locality || currentLocation?.locality || 'Nearby Food Hub'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address?.landmark ? `Near ${address.landmark}` : address?.street}
          </span>
        </div>

        {/* Footer Meta: Delivery Fee & Price For Two */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: metrics.fee === 0 ? 'var(--veg-color)' : 'var(--text-muted)' }}>
            <Bike size={14} color="var(--primary)" />
            {metrics.fee === 0 ? 'FREE DELIVERY' : `₹${metrics.fee} Delivery`}
          </span>

          <span style={{ color: 'var(--text-muted)' }}>
            ₹{priceForTwo} for two
          </span>
        </div>
      </div>

      <style>{`
        .restaurant-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
          border-color: rgba(249, 115, 22, 0.4);
        }
        .restaurant-card:hover .card-img {
          transform: scale(1.06);
        }
      `}</style>
    </Link>
  );
}
