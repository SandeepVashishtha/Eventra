import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useBookmarks from '../hooks/useBookmarks';

const SavedEventsPage = () => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [sortBy, setSortBy] = useState('savedAt');

  const sorted = [...bookmarks].sort((a, b) =>
    sortBy === 'savedAt'
      ? b.savedAt - a.savedAt
      : new Date(a.date) - new Date(b.date)
  );

  if (bookmarks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '4rem' }}>🔖</div>
        <h2>No saved events yet!</h2>
        <p style={{ color: '#6b7280' }}>
          Bookmark events you're interested in to find them here later.
        </p>
        <Link
          to="/events"
          style={{
            background: '#6366f1',
            color: 'white',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          Browse Events →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Saved Events ({bookmarks.length})</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
        >
          <option value="savedAt">Recently Saved</option>
          <option value="date">Event Date</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {sorted.map((event) => (
          <div key={event.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{event.title || event.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{event.date}</p>
            <button
              onClick={() = aria-label="button"> toggleBookmark(event)}
              style={{
                marginTop: '0.8rem',
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedEventsPage;