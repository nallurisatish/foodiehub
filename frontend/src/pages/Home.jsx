import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Bike,
  Star,
  Flame,
  CheckCircle2,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import { foodService } from '../services/foodService';
import { useLocationContext } from '../context/LocationContext';
import RestaurantCard from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import CategoryList from '../components/CategoryList';
import FoodModal from '../components/FoodModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [vegSpecial, setVegSpecial] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentLocation, openLocationModal, getNearbyRestaurants } = useLocationContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, foodRes] = await Promise.all([
          restaurantService.getRestaurants(),
          foodService.getFoods(),
        ]);

        if (restRes.success) setRestaurants(restRes.restaurants);
        if (foodRes.success) {
          setBestsellers(foodRes.foods.filter((f) => f.bestseller).slice(0, 8));
          setVegSpecial(foodRes.foods.filter((f) => f.isVegetarian).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    navigate(categoryId === 'all' ? '/menu' : `/menu?category=${encodeURIComponent(categoryId)}`);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #fff7ed 0%, var(--bg-cream) 100%)',
        padding: '4.5rem 0 3.5rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* Left Column Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {/* Delivery Location Pill */}
              <button
                type="button"
                onClick={openLocationModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'white',
                  border: '1.5px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                className="hover-lift"
                title="Click to change your delivery location"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <MapPin size={14} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>
                    Deliver to
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--charcoal)', display: 'inline-block', lineHeight: 1.2 }}>
                    {currentLocation?.locality || 'Central Food Hub'}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--primary)" />
              </button>

              {/* Promo code badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'white',
                border: '1.5px solid #fed7aa',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <Flame size={15} color="var(--primary)" fill="var(--primary)" />
                <span>FLAT 50% OFF • FOODIE50</span>
              </div>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.3rem, 5vw, 3.6rem)',
              fontWeight: 800,
              color: 'var(--charcoal)',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}>
              Discover Delicious <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--primary), #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Food Near You
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              maxWidth: '520px',
              marginBottom: '2rem',
            }}>
              Your cravings, delivered fresh. Explore curated top restaurants, authentic dum biryanis, wood-fired pizzas, and gourmet burgers in 30 minutes.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleHeroSearch} style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '520px',
              marginBottom: '1.5rem',
            }}>
              <div style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center' }}>
                <Search size={22} color="var(--primary)" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 'Chicken Biryani', 'Pizza', 'Burger'..."
                style={{
                  border: 'none',
                  outline: 'none',
                  flexGrow: 1,
                  fontSize: '1rem',
                  color: 'var(--charcoal)',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem' }}
              >
                Find Food
              </button>
            </form>

            {/* Popular Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.825rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Popular:</span>
              {['Biryani', 'Pizza', 'Paneer Butter Masala', 'Burger', 'Desserts'].map((item) => (
                <Link
                  key={item}
                  to={`/menu?search=${encodeURIComponent(item)}`}
                  style={{
                    backgroundColor: 'white',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontWeight: 500,
                  }}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column Visual Banner */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
            }}>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                alt="Delicious Gourmet Meals"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>

            {/* Floating Card 1: Fast Delivery */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              backgroundColor: 'white',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid var(--border-color)',
            }} className="hero-floating-card">
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <Bike size={22} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--charcoal)', display: 'block' }}>
                  Superfast Delivery
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Average 32 mins to doorstep
                </span>
              </div>
            </div>

            {/* Floating Card 2: Rating */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '-15px',
              backgroundColor: 'white',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--border-color)',
            }} className="hero-floating-card">
              <Star size={18} fill="var(--star-gold)" color="var(--star-gold)" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--charcoal)' }}>4.8 ★★★★★</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>50k+ Happy Foodies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Horizontal Explorer */}
      <section style={{ padding: '2.5rem 0', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)' }}>
              Inspiration for your first order
            </h2>
            <Link to="/menu" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              See all <ArrowRight size={15} />
            </Link>
          </div>

          <CategoryList
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </section>

      {/* 3. Popular & Featured Restaurants */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Handpicked Dining
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <MapPin size={11} /> Delivering to {currentLocation?.locality || 'Central Food Hub'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                Top Restaurants Delivering Near You
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={openLocationModal}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                <MapPin size={14} /> Change Location
              </button>
              <Link to="/restaurants" className="btn btn-primary btn-sm">
                View All ({restaurants.length}) <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Locating nearby restaurants delivering to you..." />
          ) : restaurants.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <UtensilsCrossed size={38} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
                Loading FoodieHub Catalog...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                Connecting to backend restaurant catalogue. If this takes more than a few seconds, click below to retry.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.55rem 1.25rem' }}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid-restaurants">
              {getNearbyRestaurants(restaurants).slice(0, 8).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Special Promo Banner */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--charcoal) 0%, #1e293b 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2rem',
            color: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ maxWidth: '580px', zIndex: 2 }}>
              <span style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginBottom: '1rem',
              }}>
                LIMITED TIME OFFER
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                Craving Biryani, Pizza, or Burgers? Get 50% OFF!
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Use voucher code <strong style={{ color: '#fed7aa', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>FOODIE50</strong> at checkout and enjoy lightning-fast doorstep delivery.
              </p>
              <Link to="/menu" className="btn btn-primary btn-lg">
                Order Now <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', zIndex: 2 }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                minWidth: '150px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>30+</span>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Signature Dishes</p>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                minWidth: '150px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>4.8 ★</span>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best-Selling Dishes */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Customer Favorites
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                Best-Selling Dishes
              </h2>
            </div>

            <Link to="/menu" className="btn btn-outline btn-sm">
              Full Menu <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-foods">
            {bestsellers.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurant={food.restaurantId}
                onOpenModal={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pure Vegetarian Specials Section */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span className="badge-veg" />
            <span style={{ fontWeight: 700, color: 'var(--veg-color)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              100% Pure Vegetarian Specials
            </span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '2rem' }}>
            Delicious Green Delights
          </h2>

          <div className="grid-foods">
            {vegSpecial.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurant={food.restaurantId}
                onOpenModal={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. How FoodieHub Works */}
      <section className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Seamless Experience
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '3rem' }}>
            How FoodieHub Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
          }}>
            {/* Step 1 */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--charcoal)' }}>
                Select Your Dishes
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Browse menus, filter by category or pure veg, and add your favorite dishes to cart.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--charcoal)' }}>
                Easy Checkout & Pay
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Pay safely via Razorpay UPI/Cards or choose convenient Cash on Delivery.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--charcoal)' }}>
                Delivered Fresh & Hot
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Track your order in real time as our delivery partner brings your fresh meal to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Food Modal Preview */}
      {selectedFood && (
        <FoodModal
          food={selectedFood}
          restaurant={selectedFood.restaurantId}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}
