import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--nonveg-bg)',
      border: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      margin: '1.5rem 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={24} color="var(--nonveg-color)" />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--nonveg-color)' }}>
          {message}
        </span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline btn-sm"
          style={{ borderColor: 'var(--nonveg-color)', color: 'var(--nonveg-color)', backgroundColor: 'white' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
