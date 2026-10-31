import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="section-padding" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>
          Privacy Policy
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
            1. Information We Collect
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            When you register on FoodieHub or place a delivery order, we collect your name, email address, contact phone number, and physical delivery address to fulfil food orders and facilitate driver dispatch.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            2. Payment Data Security
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            FoodieHub does not store full credit card numbers, CVVs, or bank credentials. All online payments are securely processed through Razorpay's PCI-DSS Level 1 compliant gateway. We receive only transaction reference tokens and payment verification signatures.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            3. Google Sign-In
          </h3>
          <p style={{ marginBottom: '1.25rem' }}>
            If you authenticate via Google Sign-In, we receive your Google ID token to verify your name, verified email, and profile avatar. We never access your Google passwords or unrelated account data.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
            4. Contact
          </h3>
          <p>
            For privacy inquiries or account deletion requests, email privacy@foodiehub.demo.
          </p>
        </div>
      </div>
    </div>
  );
}
