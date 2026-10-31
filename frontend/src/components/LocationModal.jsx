import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

export default function LocationModal() {
  const {
    currentLocation,
    selectLocation,
    detectLiveLocation,
    searchLiveAddress,
    isLocating,
    locationError,
    clearLocationError,
    isModalOpen,
    closeLocationModal,
  } = useLocationContext();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live address search with debouncing
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLiveAddress(search.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, searchLiveAddress]);

  if (!isModalOpen) return null;

  const handleUseGps = async () => {
    try {
      await detectLiveLocation();
      closeLocationModal();
    } catch (err) {
      console.warn('GPS detection failed:', err);
    }
  };

  const handleSelectSearchedLocation = (item) => {
    selectLocation(item);
    setSearch('');
    setSearchResults([]);
    closeLocationModal();
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeLocationModal}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>
              Select Delivery Location
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Choose your location to see nearby restaurants and delivery times
            </p>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. USE CURRENT LOCATION (GPS) */}
        <button
          type="button"
          onClick={handleUseGps}
          disabled={isLocating}
          style={{
            width: '100%',
            backgroundColor: '#fff7ed',
            border: '2px solid #fed7aa',
            borderRadius: '16px',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isLocating ? 'wait' : 'pointer',
            textAlign: 'left',
            marginBottom: '1.25rem',
            transition: 'all 0.2s ease',
          }}
          className="gps-btn"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
              flexShrink: 0,
            }}>
              {isLocating ? (
                <Loader2 size={20} className="spin-icon" />
              ) : (
                <Navigation size={20} />
              )}
            </div>

            <div>
              <span style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--charcoal)',
                lineHeight: 1.2,
              }}>
                {isLocating ? 'Detecting your GPS location...' : 'Use Current Location'}
              </span>
              <span style={{ fontSize: '0.785rem', color: '#9a3412', fontWeight: 600 }}>
                {isLocating ? 'Fetching satellite coordinates...' : 'Using GPS • Automatically detects your exact address'}
              </span>
            </div>
          </div>

          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--primary)',
            backgroundColor: 'white',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #fed7aa',
          }}>
            {isLocating ? 'Locating...' : 'Detect GPS'}
          </span>
        </button>

        {/* Location Error Warning */}
        {locationError && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '10px',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={clearLocationError}
              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
            Or Search Location
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* 2. SEARCH YOUR LOCATION */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for area, street name, city..."
            autoFocus
            className="form-input"
            style={{
              paddingLeft: '2.75rem',
              paddingRight: search ? '2.75rem' : '1rem',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              fontSize: '0.925rem',
              height: '48px',
              border: '1.5px solid var(--border-color)',
            }}
          />
          <Search
            size={18}
            color="var(--primary)"
            style={{ position: 'absolute', left: '16px', top: '15px' }}
          />

          {isSearching ? (
            <div style={{ position: 'absolute', right: '14px', top: '15px', color: 'var(--primary)' }}>
              <Loader2 size={18} className="spin-icon" />
            </div>
          ) : search ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSearchResults([]);
              }}
              style={{
                position: 'absolute',
                right: '14px',
                top: '15px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Live Search Suggestions */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
          {searchResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '0.2rem 0.4rem',
              }}>
                Search Results
              </span>

              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchedLocation(item)}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease',
                    border: '1px solid transparent',
                  }}
                  className="search-item"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    <MapPin size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--charcoal)' }}>
                      {item.locality || item.city}
                    </h5>
                    <p style={{
                      margin: '0.15rem 0 0',
                      fontSize: '0.775rem',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.fullAddress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : search.trim().length >= 2 && !isSearching ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No matching places found for "{search}"</p>
              <span style={{ fontSize: '0.75rem' }}>Try searching with a broader locality, city, or area name</span>
            </div>
          ) : (
            /* Current Selected Location Quick View */
            currentLocation?.locality && (
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginTop: '0.5rem',
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.3rem',
                }}>
                  Current Selected Location
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--veg-color)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--charcoal)' }}>
                    {currentLocation.locality}, {currentLocation.city}
                  </span>
                </div>
                {currentLocation.street && (
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
                    {currentLocation.street}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        .gps-btn:hover {
          border-color: var(--primary) !important;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.2);
          transform: translateY(-1px);
        }
        .search-item:hover {
          background-color: #fff7ed;
          border-color: #fed7aa !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
