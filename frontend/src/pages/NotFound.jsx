import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="section-padding" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '520px' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <UtensilsCrossed size={46} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.75rem' }}>
          Dish or Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          The page you are looking for may have been moved, renamed, or is currently off the menu.
        </p>

        <Link to="/" className="btn btn-primary btn-md">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
