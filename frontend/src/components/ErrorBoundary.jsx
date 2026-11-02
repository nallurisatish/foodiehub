import React from 'react';
import { UtensilsCrossed, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FoodieHub ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('foodiehub_user_location');
      localStorage.removeItem('foodiehub_cart_items');
      localStorage.removeItem('foodiehub_cart_restaurant');
      localStorage.removeItem('foodiehub_cart_coupon');
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafaf9',
          padding: '2rem 1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e7e5e4',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <UtensilsCrossed size={32} />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.5rem' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ fontSize: '0.925rem', color: '#78716c', lineHeight: 1.5, marginBottom: '2rem' }}>
              FoodieHub encountered an unexpected rendering error. You can reload the page or reset the app cache below.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ea580c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleResetAndReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'white',
                  color: '#44403c',
                  border: '1.5px solid #d6d3d1',
                  borderRadius: '9999px',
                  padding: '0.75rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} /> Clear Cache & Return Home
              </button>
            </div>

            {this.state.error && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#f5f5f4',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#78716c',
                cursor: 'pointer',
              }}>
                <summary style={{ fontWeight: 600, color: '#44403c' }}>Technical Details</summary>
                <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

