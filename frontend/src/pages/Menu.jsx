import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { foodService } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import FoodModal from '../components/FoodModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    const search = searchParams.get('search');
    if (search) setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const res = await foodService.getFoods({
          search: searchTerm || undefined,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          isVegetarian: isVegOnly ? 'true' : undefined,
          sort: sortBy,
        });

        if (res.success) {
          setFoods(res.foods);
        }
      } catch (err) {
        console.error('Failed to load menu dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [activeCategory, searchTerm, isVegOnly, sortBy]);

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Culinary Catalog
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            Explore All Dishes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Discover mouthwatering dum biryanis, wood-fired pizzas, hearty curries, and heavenly desserts.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isVegOnly={isVegOnly}
            setIsVegOnly={setIsVegOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
            placeholder="Search by dish name, tag, or ingredients..."
          />
        </div>

        {/* Categories Strip */}
        <div style={{ marginBottom: '2rem' }}>
          <CategoryList
            activeCategory={activeCategory}
            onSelectCategory={(catId) => setActiveCategory(catId)}
          />
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <LoadingSpinner text="Finding tasty dishes..." />
        ) : foods.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
              No dishes found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Try adjusting your search or clearing the pure veg filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchTerm('');
                setIsVegOnly(false);
              }}
              className="btn btn-outline btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-foods">
            {foods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurant={food.restaurantId}
                onOpenModal={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        )}

        {/* Food Detail Modal */}
        {selectedFood && (
          <FoodModal
            food={selectedFood}
            restaurant={selectedFood.restaurantId}
            onClose={() => setSelectedFood(null)}
          />
        )}
      </div>
    </div>
  );
}
