import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  X,
  MapPin,
  ChevronDown,
  Zap,
  Star,
  Tag,
  Bike,
  RotateCcw,
} from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { useLocationContext } from '../context/LocationContext';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CUISINES = [
  'All',
  'Biryani',
  'Pizza',
  'South Indian',
  'North Indian',
  'Burgers',
  'Chinese',
  'Fast Food',
  'Desserts',
  'Beverages',
];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('nearest');
  const [searchParams, setSearchParams] = useSearchParams();

  // Swiggy & Zomato Quick Filter Chips
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [rating4PlusOnly, setRating4PlusOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const { currentLocation, openLocationModal, getRestaurantDeliveryMetrics } = useLocationContext();

  useEffect(() => {
    const cuisineParam = searchParams.get('cuisine');
    if (cuisineParam) setSelectedCuisine(cuisineParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await restaurantService.getRestaurants({
          search: searchTerm || undefined,
          cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined,
          sort: sortBy,
        });
        if (res.success) {
          setRestaurants(res.restaurants);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [searchTerm, selectedCuisine, sortBy]);

  // Client-side quick filter & proximity sorting logic matching Swiggy / Zomato
  const displayedRestaurants = restaurants
    .filter((restaurant) => {
      if (!restaurant) return false;
      const metrics = getRestaurantDeliveryMetrics(restaurant);
      const distNum = parseFloat(metrics?.distance || '1.5');
      const timeStr = metrics?.time || '';

      if (fastDeliveryOnly && (!timeStr.includes('15') && !timeStr.includes('20') && !timeStr.includes('25') && !timeStr.includes('30'))) {
        return false;
      }
      if (rating4PlusOnly && restaurant.rating < 4.5) {
        return false;
      }
      if (vegOnly) {
        const isVeg =
          restaurant.isPureVeg ||
          (Array.isArray(restaurant.cuisineTypes) &&
            restaurant.cuisineTypes.some((c) =>
              c.toLowerCase().includes('veg') || c.toLowerCase().includes('dessert')
            ));
        if (!isVeg) return false;
      }
      if (offersOnly && !restaurant.featured) {
        return false;
      }
      if (budgetOnly && restaurant.priceForTwo > 400) {
        return false;
      }
      if (nearbyOnly && distNum > 3.5) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        const distA = parseFloat(getRestaurantDeliveryMetrics(a)?.distance || '1.5');
        const distB = parseFloat(getRestaurantDeliveryMetrics(b)?.distance || '1.5');
        return distA - distB;
      }
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'priceLow') return (a.priceForTwo || 0) - (b.priceForTwo || 0);
      if (sortBy === 'priceHigh') return (b.priceForTwo || 0) - (a.priceForTwo || 0);
      return 0;
    });

  const activeFiltersCount =
    (fastDeliveryOnly ? 1 : 0) +
    (rating4PlusOnly ? 1 : 0) +
    (vegOnly ? 1 : 0) +
    (offersOnly ? 1 : 0) +
    (budgetOnly ? 1 : 0) +
    (nearbyOnly ? 1 : 0);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('All');
    setFastDeliveryOnly(false);
    setRating4PlusOnly(false);
    setVegOnly(false);
    setOffersOnly(false);
    setBudgetOnly(false);
    setNearbyOnly(false);
  };

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Swiggy / Zomato Delivery Location Bar Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff7ed',
          border: '1.5px solid #fed7aa',
          padding: '1rem 1.4rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Delivering Food To
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {currentLocation.locality}, {currentLocation.city}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentLocation.street ? `${currentLocation.street} • ` : ''}{currentLocation.landmark || currentLocation.locality || 'Nearby Food Hub'} • {displayedRestaurants.length} restaurants delivering nearby
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openLocationModal}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--primary)',
              color: 'var(--primary-dark)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
            }}
          >
            <MapPin size={15} /> Change Delivery Location
          </button>
        </div>

        {/* Header Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Swiggy & Zomato Dining Experience
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
            Restaurants Delivering to {currentLocation.locality}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Explore curated top kitchens, wood-fired pizzerias, authentic dum biryanis, and gourmet cafes.
          </p>
        </div>

        {/* Swiggy & Zomato Quick Filter Chips Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}>
          {/* Fast Delivery */}
          <button
            type="button"
            onClick={() => setFastDeliveryOnly(!fastDeliveryOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${fastDeliveryOnly ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: fastDeliveryOnly ? 'var(--primary-light)' : 'white',
              color: fastDeliveryOnly ? 'var(--primary-dark)' : 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Zap size={14} color={fastDeliveryOnly ? 'var(--primary)' : '#eab308'} fill={fastDeliveryOnly ? 'var(--primary)' : '#eab308'} />
            Fast Delivery (&lt;30m)
          </button>

          {/* Rating 4.5+ */}
          <button
            type="button"
            onClick={() => setRating4PlusOnly(!rating4PlusOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${rating4PlusOnly ? '#15803d' : 'var(--border-color)'}`,
              backgroundColor: rating4PlusOnly ? '#dcfce7' : 'white',
              color: rating4PlusOnly ? '#15803d' : 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Star size={14} fill={rating4PlusOnly ? '#15803d' : '#f59e0b'} color={rating4PlusOnly ? '#15803d' : '#f59e0b'} />
            Rating 4.5+
          </button>

          {/* Pure Veg */}
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${vegOnly ? 'var(--veg-color)' : 'var(--border-color)'}`,
              backgroundColor: vegOnly ? 'var(--veg-bg)' : 'white',
              color: vegOnly ? 'var(--veg-color)' : 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span className="badge-veg" style={{ width: '12px', height: '12px' }} />
            Pure Veg
          </button>

          {/* Great Offers */}
          <button
            type="button"
            onClick={() => setOffersOnly(!offersOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${offersOnly ? '#2563eb' : 'var(--border-color)'}`,
              backgroundColor: offersOnly ? '#eff6ff' : 'white',
              color: offersOnly ? '#1d4ed8' : 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Tag size={14} color="#3b82f6" />
            Great Offers (FOODIE50)
          </button>

          {/* Budget Friendly */}
          <button
            type="button"
            onClick={() => setBudgetOnly(!budgetOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${budgetOnly ? 'var(--charcoal)' : 'var(--border-color)'}`,
              backgroundColor: budgetOnly ? '#f1f5f9' : 'white',
              color: 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            💰 Less than ₹400
          </button>

          {/* Nearby < 3.5 km */}
          <button
            type="button"
            onClick={() => setNearbyOnly(!nearbyOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${nearbyOnly ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: nearbyOnly ? 'var(--primary-light)' : 'white',
              color: nearbyOnly ? 'var(--primary-dark)' : 'var(--charcoal)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Bike size={14} color="var(--primary)" />
            Near Me (&lt;3.5 km)
          </button>

          {/* Active Filters Reset Pill */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #fca5a5',
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Reset Filters ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}>
          {/* Search Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px' }}>
            <Search size={20} color="var(--primary)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by restaurant name, dish, or cuisine..."
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ color: 'var(--text-light)', border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-alt)',
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="nearest">📍 Nearest First (Fastest Delivery)</option>
              <option value="rating">Top Rated (Swiggy Best)</option>
              <option value="priceLow">Cost: Low to High</option>
              <option value="priceHigh">Cost: High to Low</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Tags */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
        }}>
          {CUISINES.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isSelected ? 'var(--charcoal)' : 'white',
                  color: isSelected ? 'white' : 'var(--text-main)',
                  border: `1px solid ${isSelected ? 'var(--charcoal)' : 'var(--border-color)'}`,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {cuisine}
              </button>
            );
          })}
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <LoadingSpinner text="Searching restaurants delivering to you..." />
        ) : displayedRestaurants.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <UtensilsCrossed size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
              No restaurants match your filters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try broadening your search or resetting quick filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="btn btn-outline btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid-restaurants">
            {displayedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
