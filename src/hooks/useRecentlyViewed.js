import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from "../utils/safeJsonParse";
import { logger } from "../utils/logger";

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
  // 🔥 FIX 1: Lazy Initialization + Master's TTL logic combined
  // Initialize synchronously from localStorage to prevent double-renders and FOUC.
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = safeJsonParse(stored, []);
        const fresh = Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
        return fresh;
      }
      return [];
    } catch (err) {
      logger.error('Failed to load recently viewed events:', err);
      return [];
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (err) {
      logger.error('Failed to save recently viewed events:', err);
    }
  }, [recentlyViewed]);

  // 🔥 FIX 2: Cross-Tab Synchronization
  // Listen for storage events from other tabs to keep the React state perfectly in sync globally.
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        if (event.newValue) {
          const parsed = safeJsonParse(event.newValue, []);
          const fresh = Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
          setRecentlyViewed(fresh);
        } else {
          return [];
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
  }, [setRecentlyViewed]);

  /**
   * Remove a single event from the history.
   * @param {string|number} eventId
   */
  const removeRecentlyViewed = useCallback((eventId) => {
    setRecentlyViewed((prev) => prev.filter((e) => e.id !== eventId));
  }, [setRecentlyViewed]);

  /**
   * Clear the entire recently viewed history from state and localStorage.
   */
  const clearHistory = useCallback(() => {
    return [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      logger.error('Failed to clear recently viewed events:', err);
    }
  }, [setRecentlyViewed]);

  return {
    recentlyViewed,
    addRecentlyViewed,
    removeRecentlyViewed,
    clearHistory,
  };
};

export default useRecentlyViewed;

