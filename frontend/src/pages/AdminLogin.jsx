import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Access denied. This account does not possess administrator credentials.');
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        setError(res.message || 'Administrator login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillAdmin = () => {
    setEmail('admin@foodiehub.com');
    setPassword('Admin@123456');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#1e293b',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-xl)',
        color: 'white',
      }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 16px var(--primary-glow)',
          }}>
            <ShieldCheck size={30} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>
            Administrator Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Restricted access for FoodieHub platform staff
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@foodiehub.com"
                required
                className="form-input"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: 'white',
                  paddingLeft: '2.5rem',
                }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: 'white',
                  paddingLeft: '2.5rem',
                  paddingRight: '2.5rem',
                }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '13px', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>

        {/* Demo Seed Admin Helper */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          fontSize: '0.8rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 700, color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={14} color="var(--primary)" /> Seed Administrator Credentials
            </span>
            <button
              type="button"
              onClick={handleAutofillAdmin}
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Autofill
            </button>
          </div>
          <p style={{ color: '#94a3b8' }}>
            Email: <code>admin@foodiehub.com</code><br />
            Password: <code>Admin@123456</code>
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <Link to="/" style={{ color: '#94a3b8' }}>
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
}
