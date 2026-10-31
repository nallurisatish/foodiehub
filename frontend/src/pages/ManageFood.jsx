import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Star, UtensilsCrossed } from 'lucide-react';
import { foodService } from '../services/foodService';
import { restaurantService } from '../services/restaurantService';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'Biryani',
  'Pizza',
  'Indian Meals',
  'Burgers',
  'Starters',
  'Chinese',
  'Desserts',
  'Beverages',
  'Breakfast',
];

export default function ManageFood() {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Biryani');
  const [restaurantId, setRestaurantId] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [preparationTime, setPreparationTime] = useState('20-25 mins');
  const [bestseller, setBestseller] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [foodRes, restRes] = await Promise.all([
        foodService.getFoods(),
        restaurantService.getRestaurants(),
      ]);

      if (foodRes.success) setFoods(foodRes.foods || []);
      if (restRes.success) {
        setRestaurants(restRes.restaurants || []);
        if (restRes.restaurants?.length > 0 && !restaurantId) {
          setRestaurantId(restRes.restaurants[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load food menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingFood(null);
    setName('');
    setPrice(299);
    setCategory('Biryani');
    if (restaurants.length > 0) setRestaurantId(restaurants[0]._id);
    setImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80');
    setDescription('');
    setIsVegetarian(false);
    setIsAvailable(true);
    setPreparationTime('20-25 mins');
    setBestseller(false);
    setShowModal(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setName(food.name);
    setPrice(food.price);
    setCategory(food.category);
    setRestaurantId(food.restaurantId?._id || food.restaurantId);
    setImage(food.image);
    setDescription(food.description || '');
    setIsVegetarian(Boolean(food.isVegetarian));
    setIsAvailable(food.isAvailable !== false);
    setPreparationTime(food.preparationTime || '20-25 mins');
    setBestseller(Boolean(food.bestseller));
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !restaurantId || !image) {
      setErrorMsg('Name, price, category, restaurant, and image are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const payload = {
      name,
      price: Number(price),
      category,
      restaurantId,
      image,
      description,
      isVegetarian,
      isAvailable,
      preparationTime,
      bestseller,
    };

    try {
      if (editingFood) {
        await foodService.updateFood(editingFood._id, payload);
      } else {
        await foodService.createFood(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save food dish.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (food) => {
    try {
      await foodService.updateFood(food._id, { isAvailable: !food.isAvailable });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this food item from the menu catalog?')) {
      try {
        await foodService.deleteFood(id);
        fetchData();
      } catch (err) {
        console.error('Failed to delete food:', err);
      }
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner text="Loading food catalog..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            Manage Menu Dishes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Control food inventory, prices, pure veg tags, and stock availability
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Add Food Item
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
          <Search size={18} color="var(--primary)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dishes by name..."
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface-alt)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Dish</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1rem' }}>Restaurant</th>
              <th style={{ padding: '0.85rem 1rem' }}>Price</th>
              <th style={{ padding: '0.85rem 1rem' }}>Availability</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFoods.map((food) => (
              <tr key={food._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={food.image}
                    alt={food.name}
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className={food.isVegetarian ? 'badge-veg' : 'badge-nonveg'} />
                      <strong style={{ color: 'var(--charcoal)', fontSize: '0.9rem' }}>{food.name}</strong>
                    </div>
                    {food.bestseller && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                        ★ Bestseller
                      </span>
                    )}
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                  {food.category}
                </td>

                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {food.restaurantId?.name || 'Restaurant'}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                  ₹{food.price}
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailable(food)}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: food.isAvailable ? '#dcfce7' : '#fee2e2',
                      color: food.isAvailable ? '#15803d' : '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(food)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(food._id)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', color: 'var(--nonveg-color)' }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dish Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
              {editingFood ? 'Edit Dish' : 'Add Food Dish'}
            </h3>

            {errorMsg && (
              <p style={{ color: 'var(--nonveg-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Chicken Biryani"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Restaurant Partner</label>
                <select
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  required
                  className="form-input"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Food Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    style={{ accentColor: 'var(--veg-color)', width: '16px', height: '16px' }}
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={bestseller}
                    onChange={(e) => setBestseller(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    style={{ accentColor: 'var(--veg-color)', width: '16px', height: '16px' }}
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : editingFood ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
