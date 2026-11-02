import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Handle OAuth popup callback if inside popup window
if (typeof window !== 'undefined' && window.opener && window.location.hash) {
  const hash = window.location.hash;
  if (hash.includes('access_token=') || hash.includes('id_token=')) {
    try {
      window.opener.postMessage({ type: 'GOOGLE_AUTH_CALLBACK', hash }, window.location.origin);
      window.close();
    } catch (e) {
      console.warn('OAuth popup postMessage failed:', e);
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
