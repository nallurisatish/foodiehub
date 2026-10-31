import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minimumOrderValue, setMinimumOrderValue] = useState(199);
  const [maximumDiscount, setMaximumDiscount] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinimumOrderValue(199);
    setMaximumDiscount(100);
    setExpiryDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsActive(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      setErrorMsg('Code, discount value, and expiry date are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      await api.post('/coupons', {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minimumOrderValue),
        maximumDiscount: Number(maximumDiscount),
        expiryDate,
        isActive,
      });

      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promotional coupon code?')) {
      try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        console.error('Failed to delete coupon:', err);
      }
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving promotional vouchers..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            Promotional Coupons
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Create discount codes, set order value minimums, and track voucher campaigns
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Grid of Coupons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {coupons.map((c) => (
          <div
            key={c._id}
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1.5px dashed var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={18} color="var(--primary)" />
                <strong style={{ fontSize: '1.25rem', color: 'var(--charcoal)', letterSpacing: '0.5px' }}>
                  {c.code}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => handleToggleActive(c)}
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: c.isActive ? '#dcfce7' : '#fee2e2',
                  color: c.isActive ? '#15803d' : '#b91c1c',
                }}
              >
                {c.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '38px' }}>
              {c.description || `${c.discountValue}${c.discountType === 'percentage' ? '%' : '₹'} discount`}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-cream)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              <div>Discount: <strong>{c.discountType === 'percentage' ? `${c.discountValue}% (Max ₹${c.maximumDiscount})` : `Flat ₹${c.discountValue}`}</strong></div>
              <div>Min Order Value: <strong>₹{c.minimumOrderValue || 0}</strong></div>
              <div>Valid Until: <strong>{new Date(c.expiryDate).toLocaleDateString()}</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => handleDelete(c._id)}
                style={{ color: 'var(--nonveg-color)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
              Create Promotional Voucher
            </h3>

            {errorMsg && (
              <p style={{ color: 'var(--nonveg-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON30"
                  required
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Offer Title</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 30% OFF on all biryanis"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="form-input"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    value={minimumOrderValue}
                    onChange={(e) => setMinimumOrderValue(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maximumDiscount}
                    onChange={(e) => setMaximumDiscount(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
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
                  {saving ? 'Creating...' : 'Launch Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
