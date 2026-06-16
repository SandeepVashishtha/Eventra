import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import LazyImage from './LazyImage';
import './RecentlyViewedEvents.css';

/**
 * Pure utility function to format date strings.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Renders the header section of the RecentlyViewed component.
 */
const RecentlyViewedHeader = ({
  count,
  maxVisible,
  showAll,
  onToggleShowAll,
  confirmClear,
  onClear,
}) => {
  return (
    <div className="rv-header">
      <div className="rv-title-group">
        <span className="rv-icon" aria-hidden="true">🕑</span>
        <h2 className="rv-title">Recently Viewed</h2>
        <span className="rv-count">{count}</span>
      </div>

      <div className="rv-actions">
        {count > maxVisible && (
          <button
            className="rv-btn rv-btn--ghost"
            onClick={onToggleShowAll}
            aria-expanded={showAll}
          >
            {showAll ? 'Show Less' : `View All (${count})`}
          </button>
        )}
        <button
          className={`rv-btn ${confirmClear ? 'rv-btn--danger' : 'rv-btn--ghost'}`}
          onClick={onClear}
          title="Clear viewing history"
          aria-label="button"
        >
          {confirmClear ? '✕ Confirm Clear' : 'Clear History'}
        </button>
      </div>
    </div>
  );
};

/**
 * Renders a single event card.
 */
const RecentlyViewedCard = ({ event, onCardClick, onRemove }) => {
  return (
    <article
      className="rv-card"
      role="listitem"
      onClick={() => onCardClick(event)}
      onKeyDown={(e) => e.key === 'Enter' && onCardClick(event)}
      tabIndex={0}
      aria-label={`View event: ${event.title}`}
    >
      {/* Dismiss button */}
      <button
        className="rv-card__dismiss"
        title="Remove from history"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(event.id);
        }}
        aria-label={`Remove ${event.title} from history`}
      >
        ×
      </button>

      {/* Thumbnail */}
      <div className="rv-card__thumb">
        {event.image ? (
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="3/2"
            className="w-full h-full"
            imgClassName="object-cover"
          />
        ) : (
          <div className="rv-card__thumb-fallback" aria-hidden="true">
            🎉
          </div>
        )}

        {/* Category badge */}
        {event.category && (
          <span className="rv-card__badge">{event.category}</span>
        )}
      </div>

      {/* Content */}
      <div className="rv-card__body">
        <h3 className="rv-card__title" title={event.title}>
          {event.title}
        </h3>

        {event.date && (
          <p className="rv-card__meta rv-card__meta--date">
            <span aria-hidden="true">📅</span> {formatDate(event.date)}
          </p>
        )}

        {event.location && (
          <p className="rv-card__meta rv-card__meta--location">
            <span aria-hidden="true">📍</span> {event.location}
          </p>
        )}

        <div className="mt-auto pt-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center gap-1 hover:underline">
          Open Event <span aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
};

/**
 * RecentlyViewedTracker Component
 * 
 * Simple declarative component to trigger adding an event to history.
 * Intended to be rendered in EventDetails.js with `<RecentlyViewedTracker event={event} />`
 */
export const RecentlyViewedTracker = ({ event }) => {
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (event) {
      addRecentlyViewed(event);
    }
  }, [event, addRecentlyViewed]);

  return null;
};

/**
 * Custom hook encapsulating state and interaction logic for the RecentlyViewedEvents component.
 */
const useRecentlyViewedEventsController = ({ maxVisible, onEventClick }) => {
  const { recentlyViewed, removeRecentlyViewed, clearHistory } = useRecentlyViewed();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Auto-reset clear history confirmation state after 3 seconds
  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const visibleEvents = showAll ? recentlyViewed : recentlyViewed.slice(0, maxVisible);

  const handleCardClick = useCallback((event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  }, [onEventClick, navigate]);

  const handleClear = useCallback(() => {
    if (confirmClear) {
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }, [confirmClear, clearHistory]);

  const handleToggleShowAll = useCallback(() => {
    setShowAll((v) => !v);
  }, []);

  return {
    recentlyViewed,
    visibleEvents,
    showAll,
    confirmClear,
    handleCardClick,
    handleClear,
    handleToggleShowAll,
    removeRecentlyViewed,
  };
};

/**
 * RecentlyViewedEvents Component
 *
 * Displays a horizontal scrollable strip of recently viewed events.
 */
const RecentlyViewedEvents = ({ maxVisible = 6, onEventClick }) => {
  const {
    recentlyViewed,
    visibleEvents,
    showAll,
    confirmClear,
    handleCardClick,
    handleClear,
    handleToggleShowAll,
    removeRecentlyViewed,
  } = useRecentlyViewedEventsController({ maxVisible, onEventClick });

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="recently-viewed-section" aria-label="Recently Viewed Events">
      <RecentlyViewedHeader
        count={recentlyViewed.length}
        maxVisible={maxVisible}
        showAll={showAll}
        onToggleShowAll={handleToggleShowAll}
        confirmClear={confirmClear}
        onClear={handleClear}
      />

      <div className="rv-grid" role="list">
        {visibleEvents.map((event) => (
          <RecentlyViewedCard
            key={event.id}
            event={event}
            onCardClick={handleCardClick}
            onRemove={removeRecentlyViewed}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedEvents;