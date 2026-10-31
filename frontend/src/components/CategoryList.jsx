import React from 'react';

export const categories = [
  { id: 'all', name: 'All Dishes', icon: '🍽️' },
  { id: 'Biryani', name: 'Biryani', icon: '🍲' },
  { id: 'Pizza', name: 'Pizza', icon: '🍕' },
  { id: 'Indian Meals', name: 'Indian Meals', icon: '🍛' },
  { id: 'Burgers', name: 'Burgers', icon: '🍔' },
  { id: 'Starters', name: 'Starters', icon: '🍟' },
  { id: 'Chinese', name: 'Chinese', icon: '🥡' },
  { id: 'Desserts', name: 'Desserts', icon: '🍰' },
  { id: 'Beverages', name: 'Beverages', icon: '🥤' },
  { id: 'Breakfast', name: 'Breakfast', icon: '🥞' },
];

export default function CategoryList({ activeCategory, onSelectCategory }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      overflowX: 'auto',
      paddingBottom: '0.75rem',
      paddingTop: '0.25rem',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }} className="category-scroll">
      {categories.map((cat) => {
        const isSelected = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSelected ? 'var(--primary)' : 'white',
              color: isSelected ? 'white' : 'var(--text-main)',
              border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
              boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
              fontWeight: 600,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}

      <style>{`
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
