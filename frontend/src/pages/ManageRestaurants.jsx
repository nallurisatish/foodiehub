import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Check, X, UtensilsCrossed } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRest, setEditingRest] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [image, setImage] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('30-40 min');
  const [priceForTwo, setPriceForTwo] = useState(500);
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRestaurants = async () => {
    try {
      const res = await restaurantService.getRestaurants();
      if (res.success) setRestaurants(res.restaurants || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const openAddModal = () => {
    setEditingRest(null);
    setName('');
    setDescription('');
    setCuisineTypes('Biryani, North Indian');
    setImage('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80');
    setDeliveryFee(40);
    setEstimatedDeliveryTime('30-40 min');
    setPriceForTwo(500);
    setIsOpen(true);
    setShowModal(true);
  };

  const openEditModal = (rest) => {
    setEditingRest(rest);
    setName(rest.name);
    setDescription(rest.description || '');
    setCuisineTypes(Array.isArray(rest.cuisineTypes) ? rest.cuisineTypes.join(', ') : rest.cuisineTypes);
    setImage(rest.image);
    setDeliveryFee(rest.deliveryFee || 40);
    setEstimatedDeliveryTime(rest.estimatedDeliveryTime || '30-40 min');
    setPriceForTwo(rest.priceForTwo || 500);
    setIsOpen(rest.isOpen !== false);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      setErrorMsg('Name and cover image are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const payload = {
      name,
      description,
      cuisineTypes,
      image,
      deliveryFee: Number(deliveryFee),
      estimatedDeliveryTime,
      priceForTwo: Number(priceForTwo),
      isOpen,
    };

    try {
      if (editingRest) {
        await restaurantService.updateRestaurant(editingRest._id, payload);
      } else {
        await restaurantService.createRestaurant(payload);
      }
      setShowModal(false);
      fetchRestaurants();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save restaurant.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async (rest) => {
    try {
      await restaurantService.updateRestaurant(rest._id, { isOpen: !rest.isOpen });
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to toggle restaurant status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant and all its dishes?')) {
      try {
        await restaurantService.deleteRestaurant(id);
        fetchRestaurants();
      } catch (err) {
        console.error('Failed to delete restaurant:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading restaurants catalogue..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            Manage Restaurants
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Add, update kitchen operating hours, delivery fees, and culinary details
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Add Restaurant
        </button>
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
              <th style={{ padding: '0.85rem 1rem' }}>Restaurant</th>
              <th style={{ padding: '0.85rem 1rem' }}>Cuisines</th>
              <th style={{ padding: '0.85rem 1rem' }}>Delivery Fee</th>
              <th style={{ padding: '0.85rem 1rem' }}>Rating</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((rest) => (
              <tr key={rest._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={rest.image}
                    alt={rest.name}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem' }}>{rest.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rest.estimatedDeliveryTime}</span>
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                  {Array.isArray(rest.cuisineTypes) ? rest.cuisineTypes.join(', ') : rest.cuisineTypes}
                </td>

                <td style={{ padding: '1rem', fontWeight: 600 }}>
                  ₹{rest.deliveryFee}
                </td>

                <td style={{ padding: '1rem' }}>
                  <span className="rating-pill" style={{ fontSize: '0.75rem' }}>
                    <Star size={11} fill="white" /> {rest.rating?.toFixed(1)}
                  </span>
                </td>

                <td style={{ padding: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleOpen(rest)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: rest.isOpen ? '#dcfce7' : '#fee2e2',
                      color: rest.isOpen ? '#15803d' : '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    {rest.isOpen ? 'Open Now' : 'Closed'}
                  </button>
                </td>

                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(rest)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rest._id)}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
              {editingRest ? 'Edit Restaurant Details' : 'Add New Restaurant Partner'}
            </h3>

            {errorMsg && (
              <p style={{ color: 'var(--nonveg-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Biryani Durbar"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cuisines (Comma-separated)</label>
                <input
                  type="text"
                  value={cuisineTypes}
                  onChange={(e) => setCuisineTypes(e.target.value)}
                  placeholder="Biryani, North Indian, Mughlai"
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Est. Time</label>
                  <input
                    type="text"
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                    placeholder="30-40 min"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Price for 2 (₹)</label>
                  <input
                    type="number"
                    value={priceForTwo}
                    onChange={(e) => setPriceForTwo(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="isOpenCheck"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  style={{ accentColor: 'var(--veg-color)', width: '16px', height: '16px' }}
                />
                <label htmlFor="isOpenCheck" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Kitchen is currently Open for Orders
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
                  {saving ? 'Saving...' : editingRest ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
