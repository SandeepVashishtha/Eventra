import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import useBookmarks from '../hooks/useBookmarks';
import { exportEventsToCSV } from '../utils/exportEvents';

const SavedEventsPage = () => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [sortBy, setSortBy] = useState('savedAt');
  const [exporting, setExporting] = useState(false);

  const sorted = [...bookmarks].sort((a, b) =>
    sortBy === 'savedAt'
      ? b.savedAt - a.savedAt
      : new Date(a.date) - new Date(b.date)
  );

  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    setExporting(true);
    try {
      exportEventsToCSV(sorted, `eventra-saved-events-${new Date().toISOString().slice(0, 10)}`);
    } finally {
      // Brief visual feedback before resetting
      setTimeout(() => setExporting(false), 800);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '4rem' }}>🔖</div>
        <h2>No saved events yet!</h2>
        <p style={{ color: '#6b7280' }}>
          Bookmark events you&apos;re interested in to find them here later.
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1>Saved Events ({bookmarks.length})</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sort control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
          >
            <option value="savedAt">Recently Saved</option>
            <option value="date">Event Date</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting || sorted.length === 0}
            aria-label="Export saved events as CSV"
            title="Download saved events as a CSV file"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: exporting ? '#a5b4fc' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'background 0.2s',
            }}
          >
            <Download size={15} aria-hidden="true" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
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
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
              <Link
                to={`/events/${event.id}`}
                style={{
                  background: '#ede9fe',
                  color: '#6366f1',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                View
              </Link>
              <button
                onClick={() => toggleBookmark(event)}
                style={{
                  background: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedEventsPage;
