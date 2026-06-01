import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from "../utils/safeJsonParse";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/safeStorage.js";


const STORAGE_KEY = 'eventra_recently_viewed';
const MAX_ITEMS = 10;

// Entries older than RECENTLY_VIEWED_TTL_MS are treated as stale and evicted
// on load. 7 days balances relevance against storage growth.
export const RECENTLY_VIEWED_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Minimal entry shape
//
// Previously stored the full event object spread:
//   [event, ...filtered].slice(0, MAX_ITEMS)
//
// Full objects can be several kilobytes each. 10 entries = up to ~50 KB for
// a display-only list of small cards. Store only the fields needed to render
// the recently-viewed card and navigate to the event detail page.
// ---------------------------------------------------------------------------
const toRecentlyViewedEntry = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  category: event?.category ?? event?.type ?? "",
  viewedAt: Date.now(),
});

const isEntryFresh = (entry) => {
  const viewedAt = entry?.viewedAt;
  if (!viewedAt || typeof viewedAt !== "number") return false;
  return Date.now() - viewedAt < RECENTLY_VIEWED_TTL_MS;
};

/**
 * useRecentlyViewed
 *
 * Tracks and persists the list of recently viewed events.
 *  - Capped at MAX_ITEMS = 10 entries
 *  - Entries older than RECENTLY_VIEWED_TTL_MS (7 days) are evicted on mount
 *  - Stores only minimal display fields, not the full event object
 */
const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load from localStorage on mount, filtering out stale entries immediately
  useEffect(() => {
    try {
      const stored = safeGetItem(STORAGE_KEY);
      if (stored) {
        const parsed = safeJsonParse(stored, []);
        const fresh = Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
        setRecentlyViewed(fresh);
      }
    } catch (err) {
      console.error('Failed to load recently viewed events:', err);
      setRecentlyViewed([]);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      safeSetItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (err) {
      console.error('Failed to save recently viewed events:', err);
    }
  }, [recentlyViewed]);

  /**
   * Add or move an event to the front of the recently viewed list.
   * Stores only the minimal display entry — not the full event object.
   *
   * @param {Object} event - Event object to track.
   */
  const addRecentlyViewed = useCallback((event) => {
    if (!event || !event.id) return;

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((e) => e.id !== event.id);
      const entry = toRecentlyViewedEntry(event);
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  /**
   * Remove a single event from the history.
   * @param {string|number} eventId
   */
  const removeRecentlyViewed = useCallback((eventId) => {
    setRecentlyViewed((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  /**
   * Clear the entire recently viewed history from state and localStorage.
   */
  const clearHistory = useCallback(() => {
    setRecentlyViewed([]);
    try {
      safeRemoveItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear recently viewed events:', err);
    }
  }, []);

  return {
    recentlyViewed,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearHistory,
  };
};

export default useRecentlyViewed;
