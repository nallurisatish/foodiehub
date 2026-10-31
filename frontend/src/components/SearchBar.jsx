import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  isVegOnly,
  setIsVegOnly,
  sortBy,
  setSortBy,
  placeholder = 'Search dishes, cuisines, or restaurants...',
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      padding: '0.75rem 1.25rem',
      borderRadius: 'var(--radius-lg)',
      border: '1.5px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Search Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        flex: '1 1 280px',
        position: 'relative',
      }}>
        <Search size={20} color="var(--primary)" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem',
            color: 'var(--text-main)',
            backgroundColor: 'transparent',
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{ color: 'var(--text-light)', padding: '2px' }}
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Controls: Veg Only & Sort By */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
      }}>
        {/* Pure Veg Toggle */}
        {setIsVegOnly && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isVegOnly ? 'var(--veg-color)' : 'var(--text-main)',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={isVegOnly}
              onChange={(e) => setIsVegOnly(e.target.checked)}
              style={{ accentColor: 'var(--veg-color)', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span className="badge-veg" />
            <span>Pure Veg</span>
          </label>
        )}

        {/* Sort Select */}
        {setSortBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.6rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--charcoal)',
                backgroundColor: 'var(--bg-surface-alt)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="rating">Top Rated</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
