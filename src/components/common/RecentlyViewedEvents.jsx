import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import LazyImage from "./LazyImage";
import "./RecentlyViewedEvents.css";

/**
 * RecentlyViewedEvents
 *
 * Displays a horizontal scrollable strip of recently viewed events on the
 * HomePage / Dashboard. Reads from localStorage via the useRecentlyViewed hook.
 *
 * Props:
 *   maxVisible {number} - How many cards to show before "show more". Default 6.
 *   onEventClick {function} - Optional callback when a card is clicked.
 *                             Signature: (event) => void
 *                             If not provided, navigates to /events/:id.
 */
const RecentlyViewedEvents = ({ maxVisible = 6, onEventClick }) => {
  const { recentlyViewed, removeRecentlyViewed, clearHistory } = useRecentlyViewed();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (recentlyViewed.length === 0) return null;

  const visibleEvents = showAll ? recentlyViewed : recentlyViewed.slice(0, maxVisible);

  const handleCardClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const handleClear = () => {
    if (confirmClear) {
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="recently-viewed-section" aria-label="Recently Viewed Events">
      {/* ── Header ── */}
      <div className="rv-header">
        <div className="rv-title-group">
          <span className="rv-icon" aria-hidden="true">
            🕑
          </span>
          <h2 className="rv-title">Recently Viewed</h2>
          <span className="rv-count">{recentlyViewed.length}</span>
        </div>

        <div className="rv-actions">
          {recentlyViewed.length > maxVisible && (
            <button
              className="rv-btn rv-btn--ghost"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
            >
              {showAll ? "Show Less" : `View All (${recentlyViewed.length})`}
            </button>
          )}
          <button
            className={`rv-btn ${confirmClear ? "rv-btn--danger" : "rv-btn--ghost"}`}
            onClick={handleClear}
            title="Clear viewing history"
            aria-label="button"
          >
            {confirmClear ? "✕ Confirm Clear" : "Clear History"}
          </button>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="rv-grid" role="list">
        {visibleEvents.map((event) => (
          <article
            key={event.id}
            className="rv-card"
            role="listitem"
            onClick={() => handleCardClick(event)}
            onKeyDown={(e) => e.key === "Enter" && handleCardClick(event)}
            tabIndex={0}
            aria-label={`View event: ${event.title}`}
          >
            {/* Dismiss button */}
            <button
              className="rv-card__dismiss"
              title="Remove from history"
              onClick={(e) => {
                e.stopPropagation();
                removeRecentlyViewed(event.id);
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
                  className="h-full w-full"
                  imgClassName="object-cover"
                />
              ) : (
                <div className="rv-card__thumb-fallback" aria-hidden="true">
                  🎉
                </div>
              )}

              {/* Category badge */}
              {event.category && <span className="rv-card__badge">{event.category}</span>}
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedEvents;
