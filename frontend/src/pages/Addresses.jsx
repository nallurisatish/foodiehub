import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';

export default function Addresses() {
  const { user, addAddress, deleteAddress } = useAuth();
  const { currentLocation } = useLocationContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState(currentLocation?.city || '');
  const [state, setState] = useState(currentLocation?.state || '');
  const [pincode, setPincode] = useState(currentLocation?.pincode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addresses = user?.addresses || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!street || !city || !pincode) {
      setErrorMsg('Street, city, and pincode are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await addAddress({
        label,
        street,
        landmark,
        city,
        state,
        pincode,
        phone,
      });

      setShowAddModal(false);
      setStreet('');
      setLandmark('');
      setPincode('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addrId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addrId);
      } catch (err) {
        console.error('Failed to delete address:', err);
      }
    }
  };

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
              Saved Delivery Addresses
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Manage frequent locations for one-click express food checkout
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <MapPin size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
              No addresses saved yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Save your home, apartment, or office address to checkout faster.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm"
            >
              + Add First Address
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: 'var(--charcoal)',
                      backgroundColor: 'var(--primary-light)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}>
                      {addr.label === 'Work' ? <Briefcase size={14} /> : <Home size={14} />}
                      {addr.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr._id)}
                      style={{ color: 'var(--text-light)', padding: '4px' }}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--charcoal)', marginBottom: '0.25rem' }}>
                    {addr.street}
                  </p>
                  {addr.landmark && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  {addr.phone && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                      Phone: {addr.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
                Add New Delivery Address
              </h3>

              {errorMsg && (
                <div style={{ color: 'var(--nonveg-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAdd}>
                <div className="form-group">
                  <label className="form-label">Address Type</label>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {['Home', 'Work', 'Other'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLabel(t)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${label === t ? 'var(--primary)' : 'var(--border-color)'}`,
                          backgroundColor: label === t ? 'var(--primary-light)' : 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: label === t ? 'var(--primary-dark)' : 'var(--text-main)',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / House No. & Street</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 204, Green View Towers, 12th Main"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="560001"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
