import React from 'react';
import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';

export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* Option 1: Razorpay Online */}
      <div
        onClick={() => onSelectMethod('Razorpay')}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: `2px solid ${
            selectedMethod === 'Razorpay' ? 'var(--primary)' : 'var(--border-color)'
          }`,
          backgroundColor:
            selectedMethod === 'Razorpay' ? 'var(--primary-light)' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selectedMethod === 'Razorpay' ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="Razorpay"
          checked={selectedMethod === 'Razorpay'}
          onChange={() => onSelectMethod('Razorpay')}
          style={{ accentColor: 'var(--primary)', marginTop: '4px', width: '18px', height: '18px' }}
        />

        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>
              Online Payment (Razorpay)
            </span>
            <span style={{
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
            }}>
              Instant Confirmation
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Pay seamlessly using UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, or NetBanking.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--veg-color)', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>256-Bit Encrypted & RBI Compliant</span>
          </div>
        </div>
      </div>

      {/* Option 2: Cash on Delivery */}
      <div
        onClick={() => onSelectMethod('Cash on Delivery')}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: `2px solid ${
            selectedMethod === 'Cash on Delivery' ? 'var(--primary)' : 'var(--border-color)'
          }`,
          backgroundColor:
            selectedMethod === 'Cash on Delivery' ? 'var(--primary-light)' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selectedMethod === 'Cash on Delivery' ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="Cash on Delivery"
          checked={selectedMethod === 'Cash on Delivery'}
          onChange={() => onSelectMethod('Cash on Delivery')}
          style={{ accentColor: 'var(--primary)', marginTop: '4px', width: '18px', height: '18px' }}
        />

        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>
              Cash on Delivery (COD)
            </span>
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
            }}>
              Pay at Doorstep
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Pay cash or scan delivery partner's UPI QR code upon arrival of your hot meal.
          </p>
        </div>
      </div>
    </div>
  );
}
