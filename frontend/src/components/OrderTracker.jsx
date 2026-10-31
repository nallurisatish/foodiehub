import React from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Home,
  XCircle,
  RefreshCw,
} from 'lucide-react';

const STAGES = [
  { key: 'Pending', label: 'Order Placed', desc: 'Sent to kitchen', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Restaurant accepted', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Preparing', desc: 'Chef cooking fresh', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'On the way', icon: Bike },
  { key: 'Delivered', label: 'Delivered', desc: 'Enjoy your meal!', icon: Home },
];

export default function OrderTracker({ orderStatus, statusHistory = [], onRefresh, isRefreshing }) {
  if (orderStatus === 'Cancelled') {
    return (
      <div style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--nonveg-bg)',
        border: '1.5px solid var(--nonveg-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <XCircle size={36} color="var(--nonveg-color)" />
        <div>
          <h4 style={{ color: 'var(--nonveg-color)', fontWeight: 700, fontSize: '1.1rem' }}>
            Order Cancelled
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
            This order has been cancelled and will not be prepared. If you paid online, refund will be credited back to your source account.
          </p>
        </div>
      </div>
    );
  }

  // Calculate current stage index
  const currentIndex = STAGES.findIndex((s) => s.key === orderStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Top Bar with Live Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Status Tracker
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--charcoal)' }}>
            {STAGES[activeIdx]?.label || orderStatus}
          </h3>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-alt)',
            }}
          >
            <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* 5-Step Horizontal Tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0 0.5rem',
      }}>
        {/* Background Connecting Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '30px',
          right: '30px',
          height: '4px',
          backgroundColor: 'var(--border-color)',
          zIndex: 1,
        }}>
          {/* Active Filled Line */}
          <div style={{
            height: '100%',
            backgroundColor: 'var(--primary)',
            width: `${(activeIdx / (STAGES.length - 1)) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
                flex: '1 1 0',
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'var(--primary)' : 'white',
                  color: isCompleted ? 'white' : 'var(--text-light)',
                  border: `3px solid ${isCompleted ? 'var(--primary)' : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                  boxShadow: isCurrent ? '0 0 0 5px var(--primary-glow)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon size={18} />
              </div>

              {/* Title & Desc */}
              <span style={{
                fontSize: '0.85rem',
                fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                color: isCompleted ? 'var(--charcoal)' : 'var(--text-light)',
                lineHeight: 1.2,
                marginBottom: '0.2rem',
              }}>
                {stage.label}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'none' }} className="tracker-desc">
                {stage.desc}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 640px) {
          .tracker-desc { display: block !important; }
        }
      `}</style>
    </div>
  );
}
