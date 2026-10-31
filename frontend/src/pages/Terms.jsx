import React from 'react';

export default function Terms() {
  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Last Updated: October 2026
        </p>

        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          lineHeight: '1.8',
          color: 'var(--text-main)',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            1. Service Scope
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            FoodieHub operates an online multi-vendor food catalog and order coordination platform connecting customers with licensed restaurant partners and independent delivery agents.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            2. Orders & Single Restaurant Rule
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Each individual order may contain food items from a single restaurant partner to guarantee food arrives hot, fresh, and on time. If you wish to order from multiple restaurants, please complete separate transactions.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            3. Cancellation & Refund Policy
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            Orders may be cancelled free of charge while in 'Pending' or 'Confirmed' status. Once kitchen preparation or delivery pickup has commenced ('Preparing' or 'Out for Delivery'), cancellation is locked to avoid food wastage. Eligible refunds for online paid orders are credited to original payment methods.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            4. Educational Demonstration Notice
          </h3>
          <p>
            FoodieHub is developed as a B.Tech Computer Science and Engineering portfolio project. Sample dishes and test payment transactions operate in sandbox/test mode.
          </p>
        </div>
      </div>
    </div>
  );
}
