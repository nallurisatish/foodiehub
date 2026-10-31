import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function LoadingSpinner({ text = 'Preparing delicious meals...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '260px',
      padding: '2rem',
    }}>
      <div style={{
        position: 'relative',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Pulsing glow background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          animation: 'pulseGlow 1.5s ease-in-out infinite',
        }} />

        {/* Spinning border ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'var(--primary)',
          borderRightColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }} />

        <UtensilsCrossed size={28} color="var(--primary)" />
      </div>

      <p style={{
        marginTop: '1.25rem',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
      }}>
        {text}
      </p>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
