import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await updateProfile({ name, phone });
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.3rem' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Manage your personal account details and communication preferences
        </p>

        {successMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: 'var(--veg-color)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--nonveg-bg)',
            border: '1px solid #fecaca',
            color: 'var(--nonveg-color)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Avatar & Email Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '1.6rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal)' }}>
                {user?.name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
              <span style={{
                display: 'inline-block',
                marginTop: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: user?.role === 'admin' ? '#2563eb' : 'var(--veg-color)',
                backgroundColor: user?.role === 'admin' ? '#dbeafe' : 'var(--veg-bg)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'capitalize',
              }}>
                {user?.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read Only)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}
                />
                <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', padding: '0.8rem 1.75rem' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
