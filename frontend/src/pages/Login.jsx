import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo autofill for rapid testing
  const handleQuickCustomer = () => {
    setEmail('customer.demo@foodiehub.com');
    setPassword('Customer@123');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <UtensilsCrossed size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.2rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Log in to order fresh meals and track your deliveries
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--nonveg-bg)',
            border: '1px solid #fecaca',
            color: 'var(--nonveg-color)',
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

        {/* Google Authentication */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleSignInButton onSuccess={() => navigate(from, { replace: true })} />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
          color: 'var(--text-light)',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span>OR CONTINUE WITH EMAIL</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--text-light)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-cream)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} color="var(--primary)" /> Demo Evaluator Login
            </span>
            <button
              type="button"
              onClick={handleQuickCustomer}
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Autofill
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Customer: <code>customer.demo@foodiehub.com</code> / <code>Customer@123</code>
          </p>
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign up now
          </Link>
        </div>

        <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <Link to="/admin/login" style={{ color: 'var(--text-light)' }}>
            Are you an administrator? Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
}
