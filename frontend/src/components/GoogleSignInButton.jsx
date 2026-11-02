import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const DEFAULT_GOOGLE_CLIENT_ID = '948457484596-69pbmk5tdrjiudbg84h7pvsm47onnubg.apps.googleusercontent.com';

export default function GoogleSignInButton({ onSuccess, text = 'Continue with Google' }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOriginHelp, setShowOriginHelp] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Read Client ID from build env, localStorage, or default
  const [clientId, setClientId] = useState(() => {
    const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envId && !envId.includes('demo') && !envId.includes('your_google_client_id')) {
      return envId.trim();
    }
    const localId = localStorage.getItem('foodiehub_google_client_id');
    if (localId && localId.trim()) return localId.trim();
    return DEFAULT_GOOGLE_CLIENT_ID;
  });

  const googleBtnContainerRef = useRef(null);

  // Dynamically fetch client ID from backend if available (supports Render env vars without rebuilding Vite)
  useEffect(() => {
    let active = true;
    if (authService.getGoogleClientId) {
      authService.getGoogleClientId()
        .then((res) => {
          if (active && res?.success && res?.clientId) {
            setClientId((prev) => (prev !== res.clientId ? res.clientId : prev));
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, []);

  // Listen for popup callback message if opened in a popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_CALLBACK' && event.data?.hash) {
        const hash = event.data.hash.replace(/^#/, '');
        const params = new URLSearchParams(hash);
        const token = params.get('access_token') || params.get('id_token');
        if (token) {
          setLoading(true);
          setError('');
          try {
            const res = await googleLogin(token);
            if (res.success && onSuccess) {
              onSuccess();
            } else {
              setError(res.message || 'Google authentication failed.');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Google login failed.');
          } finally {
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [googleLogin, onSuccess]);

  // Initialize official Google Identity Services (GIS) on mount
  useEffect(() => {
    if (!clientId) return;

    let checkTimer1;
    let checkTimer2;

    const initGIS = () => {
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              setError('');
              setShowOriginHelp(false);
              try {
                const res = await googleLogin(response.credential);
                if (res.success && onSuccess) {
                  onSuccess();
                } else {
                  setError(res.message || 'Google authentication failed on server.');
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Google login failed.');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: text.toLowerCase().includes('sign up') ? 'signup_with' : 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 380,
        });

        // Verify if GIS successfully rendered an iframe
        // (Google silently clears/skips rendering if the current origin is not in Authorized JavaScript Origins)
        checkTimer1 = setTimeout(() => {
          if (googleBtnContainerRef.current && googleBtnContainerRef.current.children.length > 0) {
            setGisReady(true);
          } else {
            setGisReady(false);
          }
        }, 600);

        checkTimer2 = setTimeout(() => {
          if (googleBtnContainerRef.current && googleBtnContainerRef.current.children.length > 0) {
            setGisReady(true);
          } else {
            setGisReady(false);
          }
        }, 1500);
      } catch (err) {
        console.warn('GIS initialization notice:', err);
        setGisReady(false);
      }
    };

    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGIS();
        }
      }, 250);
      return () => clearInterval(timer);
    }

    return () => {
      clearTimeout(checkTimer1);
      clearTimeout(checkTimer2);
    };
  }, [clientId, text, googleLogin, onSuccess]);

  // One-click demo Google account for evaluators / testing
  const handleDemoGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const demoToken = `mock_google_token_foodie.tester_${Date.now().toString().slice(-4)}@gmail.com`;
      const res = await googleLogin(demoToken);
      if (res.success && onSuccess) {
        onSuccess();
      } else {
        setError(res.message || 'Demo Google sign-in failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  // DIRECT ACCESS fallback if official GIS iframe has not rendered or was blocked
  const handleDirectGoogleAuth = () => {
    setError('');
    setShowOriginHelp(false);

    if (!clientId) {
      setError('Google Client ID is not configured.');
      return;
    }

    setLoading(true);

    // Strategy 1: GIS Token Client popup
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId.trim(),
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              try {
                const res = await googleLogin(tokenResponse.access_token);
                if (res.success && onSuccess) {
                  onSuccess();
                } else {
                  setError(res.message || 'Google authentication failed on server.');
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Google login failed.');
              } finally {
                setLoading(false);
              }
            } else if (tokenResponse.error) {
              setLoading(false);
              setShowOriginHelp(true);
              setError(`Google OAuth origin error: "${tokenResponse.error}". Your Render domain (${window.location.origin}) must be authorized in Google Cloud Console.`);
            }
          },
          error_callback: (err) => {
            setLoading(false);
            setShowOriginHelp(true);
            setError(`Google OAuth Error: ${err.message || 'Origin not allowed'}.`);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('tokenClient notice:', err);
      }
    }

    // Strategy 2: Direct OAuth 2.0 URL popup
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId.trim(),
        redirect_uri: window.location.origin,
        response_type: 'token id_token',
        scope: 'email profile openid',
        prompt: 'select_account',
        nonce: Math.random().toString(36).substring(2),
      }).toString();

      const popup = window.open(authUrl, 'GoogleSignIn', 'width=520,height=640,status=no,toolbar=no');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setError(`Popup was blocked by your browser! Please allow popups for ${window.location.host}.`);
      }
    } catch (e) {
      setError(`Failed to open Google window: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyOrigin = () => {
    navigator.clipboard?.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 1. Official Google Identity Services Button Container (Shown when GIS ready) */}
      <div
        ref={googleBtnContainerRef}
        style={{
          width: '100%',
          display: gisReady ? 'flex' : 'none',
          justifyContent: 'center',
          minHeight: '44px',
        }}
      />

      {/* 2. Custom Google Button Fallback (Shown when GIS iframe is not rendered or blocked) */}
      {!gisReady && (
        <button
          type="button"
          onClick={handleDirectGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: 'white',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--charcoal)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          className="google-btn"
        >
          {/* Official Google 'G' SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          <span>{loading ? 'Connecting with Google...' : text}</span>
        </button>
      )}

      {/* Error Feedback */}
      {error && (
        <p style={{ color: 'var(--nonveg-color)', fontSize: '0.8rem', marginTop: '0.6rem', textAlign: 'center', lineHeight: 1.4 }}>
          {error}
        </p>
      )}

      {/* Origin Authorization & Quick-Test Helper Box */}
      {(showOriginHelp || (!gisReady && window.location.hostname !== 'localhost')) && (
        <div style={{
          marginTop: '0.85rem',
          maxWidth: '380px',
          width: '100%',
          padding: '0.85rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: '#1e3a8a',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🌐 Authorize this Render Domain:</span>
            <button
              type="button"
              onClick={copyOrigin}
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: copied ? '#16a34a' : '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', background: '#dbeafe', padding: '3px 6px', borderRadius: '4px' }}>
            {window.location.origin}
          </p>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#3b82f6' }}>
            Add this URL to <strong>Authorized JavaScript origins</strong> in Google Cloud Console.
          </p>
          <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '0.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleDemoGoogleAuth}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              ⚡ Instant Test: Sign in with Demo Google Profile
            </button>
          </div>
        </div>
      )}

      <style>{`
        .google-btn:hover:not(:disabled) {
          background-color: var(--bg-surface-alt);
          border-color: #cbd5e1;
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
