import { useState, useEffect, useCallback } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";
import { logger } from "../utils/logger";

/**
 * @file useRecentlyViewed.js
 * @description React hook to track, manage, and persist a collection of recently viewed events.
 */

/**
 * The key used to persist recently viewed events in localStorage.
 * @type {string}
 */
const STORAGE_KEY = "eventra_recently_viewed";

/**
 * The maximum number of recently viewed items to retain.
 * @type {number}
 */
const MAX_ITEMS = 10;

/**
 * Time-to-live (TTL) duration for recently viewed entries (7 days in milliseconds).
 * Entries older than this limit are considered stale and evicted from storage.
 * @type {number}
 */
export const RECENTLY_VIEWED_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @typedef {Object} RecentlyViewedEntry
 * @property {string|number} id - Unique identifier of the event.
 * @property {string} title - Title of the event.
 * @property {string} date - Event date representation.
 * @property {string} location - Venue or location of the event.
 * @property {string} image - URL to the event's promotional image.
 * @property {string} category - Classification type of the event.
 * @property {number} viewedAt - Timestamp (Unix epoch) representing when the event was viewed.
 */

/**
 * Transforms a full event object into a minimal shape to conserve localStorage space.
 * Full objects can be several kilobytes each; storing only basic card fields keeps
 * the browser's storage overhead extremely light.
 *
 * @param {Object} event - The full event object.
 * @returns {RecentlyViewedEntry} A lightweight representation of the event for display cards.
 */
const toRecentlyViewedEntry = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  category: event?.category ?? event?.type ?? "",
  viewedAt: Date.now(),
});

/**
 * Checks if a recently viewed entry is still within the allowable TTL window (fresh).
 *
 * @param {RecentlyViewedEntry} entry - The entry to validate.
 * @returns {boolean} True if the entry timestamp is less than 7 days old, false otherwise.
 */
const isEntryFresh = (entry) => {
  const viewedAt = entry?.viewedAt;
  if (!viewedAt || typeof viewedAt !== "number") return false;
  return Date.now() - viewedAt < RECENTLY_VIEWED_TTL_MS;
};

/**
 * Custom React hook for tracking and persisting a list of recently viewed events.
 *
 * ### Hook Overview
 * This hook maintains a user's local navigation history of events. It optimizes storage by
 * pruning unused properties, limits retention to a max of 10 items, and evicts entries older than
 * 7 days. Additionally, it implements cross-tab synchronization so changes in one browser window
 * immediately reflect in others.
 *
 * ### Behavior Notes
 * - **Deduplication**: Adding an already-viewed event pulls it to the front of the queue.
 * - **Expiration**: Stale entries are evicted on load and whenever storage updates.
 * - **Persistence**: Saves state using standard `localStorage`.
 * - **Synchronization**: Listens for window `'storage'` events to keep active tabs in sync.
 *
 * ### Performance Considerations
 * - Reads storage lazily during initialization to prevent layout shifts or double-renders.
 * - Callbacks are wrapped in `useCallback` to allow efficient child re-rendering.
 *
 * ### Edge Cases
 * - **Disabled/Missing Storage**: Catches write/read errors gracefully, utilizing a fallback in-memory state.
 * - **Malformed Data**: Sanitizes parsed JSON using {@link safeJsonParse} to avoid runtime crashes.
 *
 * @returns {Object} Hook interfaces and state.
 * @returns {RecentlyViewedEntry[]} return.recentlyViewed - Array of minimal viewed event objects ordered from newest to oldest.
 * @returns {function(Object): void} return.addRecentlyViewed - Callback to record a new viewed event. Accepts the full event object.
 * @returns {function(string|number): void} return.removeRecentlyViewed - Callback to remove a specific event from history by ID.
 * @returns {function(): void} return.clearHistory - Callback to purge the entire local history.
 *
 * @example
 * import useRecentlyViewed from './hooks/useRecentlyViewed';
 *
 * const RecentEventsComponent = () => {
 *   const { recentlyViewed, addRecentlyViewed, removeRecentlyViewed, clearHistory } = useRecentlyViewed();
 *
 *   // To track a new event
 *   // addRecentlyViewed(currentEvent);
 *
 *   return (
 *     <div>
 *       <h2>Recently Viewed Events</h2>
 *       <button onClick={clearHistory}>Clear All</button>
 *       <ul>
 *         {recentlyViewed.map(event => (
 *           <li key={event.id}>
 *             {event.title}
 *             <button onClick={() => removeRecentlyViewed(event.id)}>Remove</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * };
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
      logger.error("Failed to load recently viewed events:", err);
      return [];
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (err) {
      logger.error("Failed to save recently viewed events:", err);
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
          setRecentlyViewed([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      logger.error("Failed to clear recently viewed events:", err);
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
