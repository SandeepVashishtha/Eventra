import { useState, useEffect, useCallback } from 'react';

const useBookmarks = (userId = 'guest') => {
  const storageKey = `bookmarks_${userId}`;

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  /**
   * Toggles bookmark state for an event.
   * Wrapped in useCallback so the reference is stable across renders —
   * callers can safely add it to useEffect / useMemo dependency arrays
   * without triggering infinite loops.
   */
  const toggleBookmark = useCallback((event) => {
    setBookmarks((prev) =>
      prev.find((e) => e.id === event.id)
        ? prev.filter((e) => e.id !== event.id)
        : [...prev, { ...event, savedAt: Date.now() }]
    );
  }, []);

  /**
   * Returns true if an event with the given id is currently bookmarked.
   * Wrapped in useCallback so the reference stays stable for consumers
   * that memoize derived state or pass it as a prop.
   */
  const isBookmarked = useCallback(
    (id) => bookmarks.some((e) => e.id === id),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked };
};

export default useBookmarks;