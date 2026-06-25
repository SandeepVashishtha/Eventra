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
const STORAGE_KEY = "recentlyViewedEvents";

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
const loadInitialHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = safeJsonParse(stored, []);
      return Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
    }
    return [];
  } catch (err) {
    logger.error("Failed to load recently viewed events:", err);
    return [];
  }
};

/**
 * Top-level helper to save the history array.
 */
const saveHistory = (items) => {
  try {
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch (err) {
    logger.error("Failed to save recently viewed events:", err);
  }
};

/**
 * Top-level helper to handle cross-tab storage changes.
 */
const handleStorageUpdate = (event, callback) => {
  if (event.key !== STORAGE_KEY) return;
  if (event.newValue) {
    const parsed = safeJsonParse(event.newValue, []);
    const fresh = Array.isArray(parsed) ? parsed.filter(isEntryFresh) : [];
    callback(fresh);
  } else {
    callback([]);
  }
};

/**
 * Top-level helper to append/prepend an event to the history array.
 */
const pushHistoryEvent = (prevList, event) => {
  const eventId = event?.id;
  if (!event || !eventId) return prevList;
  const filtered = prevList.filter((e) => String(e.id) !== String(eventId));
  const entry = toRecentlyViewedEntry(event);
  return [entry, ...filtered].slice(0, MAX_ITEMS);
};

/**
 * Custom React hook for tracking and persisting a list of recently viewed events.
 */
const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(loadInitialHistory);

  useEffect(() => {
    saveHistory(recentlyViewed);
  }, [recentlyViewed]);

  useEffect(() => {
    const handleStorageChange = (event) => handleStorageUpdate(event, setRecentlyViewed);
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addRecentlyViewed = useCallback((event) => {
    setRecentlyViewed((prev) => pushHistoryEvent(prev, event));
  }, []);

  const removeRecentlyViewed = useCallback((eventId) => {
    setRecentlyViewed((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
  }, []);

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
