import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Search,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  ExternalLink,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../context/CartContext';
import { useLocationContext } from '../context/LocationContext';
import FoodCard from '../components/FoodCard';
import FoodModal from '../components/FoodModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    currentLocation,
    openLocationModal,
    getLocalizedRestaurant,
    getRestaurantDeliveryMetrics,
  } = useLocationContext();

  const localRest = getLocalizedRestaurant(restaurant) || restaurant;
  const metrics = getRestaurantDeliveryMetrics(restaurant);

  const mapsUrl =
    localRest?.googleMapsUrl ||
    restaurant?.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${restaurant.name} ${currentLocation.locality || ''} ${currentLocation.city || ''}`
    )}`;

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* 1. Restaurant Hero Banner */}
      <div style={{
        background: 'linear-gradient(180deg, #1e293b 0%, var(--charcoal) 100%)',
        color: 'white',
        padding: '3rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-xl)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            />

            <div style={{ flexGrow: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.2rem', color: 'white', fontWeight: 800 }}>
                  {restaurant.name}
                </h1>
                <div className="rating-pill" style={{ fontSize: '0.9rem', padding: '0.25rem 0.6rem' }}>
                  <Star size={14} fill="white" color="white" />
                  <span>{restaurant.rating?.toFixed(1)}</span>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                {Array.isArray(restaurant.cuisineTypes) ? restaurant.cuisineTypes.join(', ') : restaurant.cuisineTypes}
              </p>

              {/* Delivery info & Dynamic Distance based on chosen location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'white', fontWeight: 700 }}>
                  <Clock size={16} color="var(--primary)" />
                  {metrics.time}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'white', fontWeight: 700 }}>
                  <MapPin size={16} color="var(--primary)" />
                  {metrics.distance} away
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: metrics.fee === 0 ? '#4ade80' : 'white', fontWeight: 700 }}>
                  <Bike size={16} color="var(--primary)" />
                  {metrics.fee === 0 ? 'Free Delivery' : `₹${metrics.fee} Delivery`}
                </span>
                <span>•</span>
                <span>₹{restaurant.priceForTwo} for two</span>
              </div>

              {/* Delivering to User Location Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Delivering to: <strong style={{ color: 'white' }}>{currentLocation.locality}</strong>
                </span>
                <button
                  type="button"
                  onClick={openLocationModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-light)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Real-Life Physical Location & Address Card */}
          {restaurant.address && (
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', maxWidth: '640px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <MapPin size={22} color="white" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>
                      {localRest.address?.doorNo ? `${localRest.address.doorNo}, ` : ''}{localRest.address?.street}
                    </span>
                    {localRest.address?.locality && (
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(249, 115, 22, 0.3)',
                        color: '#fed7aa',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(249, 115, 22, 0.4)',
                      }}>
                        📍 {localRest.address.locality}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {localRest.address?.landmark ? `Landmark: ${localRest.address.landmark} • ` : ''}
                    {localRest.address?.city}, {localRest.address?.state} - {localRest.address?.pincode}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'inline-block', marginTop: '0.25rem' }}>
                    GPS: {localRest.coordinates?.lat?.toFixed(4)}, {localRest.coordinates?.lng?.toFixed(4)} • {localRest.distance || '1.2 km'} from your live location
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1rem',
                    backgroundColor: 'white',
                    color: 'var(--charcoal)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <MapPin size={15} color="var(--primary)" />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={13} />
                </a>

                {restaurant.contactPhone && (
                  <a
                    href={`tel:${restaurant.contactPhone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.9rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <Phone size={14} />
                    <span>{restaurant.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Menu Controls: Search, Veg Toggle, Category Tabs */}
      <div style={{
        position: 'sticky',
        top: '76px',
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-surface-alt)',
                    color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right: Search & Veg Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={isVegOnly}
                  onChange={(e) => setIsVegOnly(e.target.checked)}
                  style={{ accentColor: 'var(--veg-color)' }}
                />
                <span className="badge-veg" />
                <span>Veg Only</span>
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-surface-alt)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
              }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in menu..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.85rem',
                    width: '130px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dishes Grid */}
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {filteredMenu.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <UtensilsCrossed size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)' }}>
              No dishes found matching criteria
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Try unticking pure veg or searching for something else.
            </p>
          </div>
        ) : (
          <div className="grid-foods">
            {filteredMenu.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurant={restaurant}
                onOpenModal={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Food Detail Modal */}
      {selectedFood && (
        <FoodModal
          food={selectedFood}
          restaurant={restaurant}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {/* 5. Sticky Bottom Floating Cart Strip */}
      {totalItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '680px',
          backgroundColor: 'var(--charcoal)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 90,
          animation: 'slideUp 0.3s ease',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'} Added
            </span>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>
              ₹{grandTotal} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#cbd5e1' }}>(plus taxes)</span>
            </p>
          </div>

          <Link
            to="/cart"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, padding: '0.65rem 1.4rem' }}
          >
            View Cart <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
