import { useState, useEffect, useCallback } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";
import { safeLocalStorage } from "../utils/safeStorage";
import { logger } from "../utils/logger";

const STORAGE_KEY = "eventra_recently_viewed";
const MAX_ITEMS = 10;

/**
 * The key used to persist recently viewed events in localStorage.
 * @type {string}
 */
const STORAGE_KEY = 'recentlyViewedEvents';

/**
 * The maximum number of recently viewed items to retain.
 * @type {number}
 */
const MAX_ITEMS = 5;

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
 */
const toRecentlyViewedEntry = (event) => {
  const eventId = event?.id;
  return {
    id: eventId,
    title: event.title,
    date: event?.date ?? "",
    location: event?.location ?? "",
    image: event.image,
    category: event.category,
    viewedAt: Date.now(),
  };
};

/**
 * Checks if a recently viewed entry is still within the allowable TTL window (fresh).
 */
const isEntryFresh = (entry) => {
  const viewedAt = entry?.viewedAt;
  if (!viewedAt || typeof viewedAt !== "number") return true;
  return Date.now() - viewedAt < RECENTLY_VIEWED_TTL_MS;
};

/**
 * Top-level helper to load the initial history array.
 */
const useRecentlyViewed = () => {
  // 🔥 FIX 1: Lazy Initialization + Master's TTL logic combined
  // Initialize synchronously from localStorage to prevent double-renders and FOUC.
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = safeJsonParse(stored, []);
        const fresh = Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
        return fresh;
      } catch (err) {
        logger.error("Failed to load recently viewed events:", err);
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    saveHistory(recentlyViewed);
  }, [recentlyViewed]);

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Add or move an event to the front of the recently viewed list.
   * Stores only the minimal display entry — not the full event object.
   *
   * @param {Object} event - Event object to track.
   */
  const addRecentlyViewed = useCallback(
    (event) => {
      if (!event || !event.id) return;

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((e) => e.id !== event.id);
      const entry = toRecentlyViewedEntry(event);
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  }, [setRecentlyViewed]);

  const removeRecentlyViewed = useCallback((eventId) => {
    setRecentlyViewed((prev) => prev.filter((e) => e.id !== eventId));
  }, [setRecentlyViewed]);

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
