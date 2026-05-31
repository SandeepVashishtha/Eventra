import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from "../utils/safeJsonParse";

const STORAGE_KEY = 'eventra_recently_viewed';
const MAX_ITEMS = 10;

/**
 * useRecentlyViewed
 * 
 * Custom hook to track and manage recently viewed events using localStorage.
 * 
 * Usage:
 *   const { recentlyViewed, addRecentlyViewed, clearHistory } = useRecentlyViewed();
 * 
 * Call `addRecentlyViewed(event)` when a user opens/views an event.
 * The hook stores the full event object (id, title, date, image, category, etc.)
 * so the section can render without extra API calls.
 * 
 * Limits: MAX_ITEMS entries; duplicate events are moved to the top.
 */
const useRecentlyViewed = () => {
  // 🔥 FIX 1: Lazy Initialization
  // Initialize synchronously from localStorage to prevent double-renders and FOUC.
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? safeJsonParse(stored, []) : [];
    } catch (err) {
      console.error('Failed to load recently viewed events on mount:', err);
      return [];
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (err) {
      console.error('Failed to save recently viewed events:', err);
    }
  }, [recentlyViewed]);

  // 🔥 FIX 2: Cross-Tab Synchronization
  // Listen for storage events from other tabs to keep the React state perfectly in sync globally.
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        if (event.newValue) {
          setRecentlyViewed(safeJsonParse(event.newValue, []));
        } else {
          setRecentlyViewed([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Add or move an event to the front of the recently viewed list.
   * @param {Object} event - The event object to track.
   *   Expected shape: { id, title, date, location, image, category, ... }
   */
  const addRecentlyViewed = useCallback((event) => {
    if (!event || !event.id) return;

    setRecentlyViewed((prev) => {
      // Remove existing entry for this event (avoid duplicates)
      const filtered = prev.filter((e) => e.id !== event.id);
      // Prepend and cap at MAX_ITEMS
      return [event, ...filtered].slice(0, MAX_ITEMS);
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
   * Clear the entire recently viewed history.
   */
  const clearHistory = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
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