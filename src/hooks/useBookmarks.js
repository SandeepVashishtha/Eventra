/**
 * @fileoverview useBookmarks - Event bookmarks management hook
 * @module hooks/useBookmarks
 */
import { useState, useEffect, useCallback } from "react";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/safeStorage.js";


/**
 * A custom React hook that manages bookmarked events for a user,
 * persisting them to localStorage keyed by userId.
 *
 * @param {string} [userId='guest'] - The user ID used as localStorage key
 *
 * @returns {{
 *   bookmarks: Object[],
 *   toggleBookmark: (event: Object) => void,
 *   isBookmarked: (id: string|number) => boolean
 * }}
 *
 * @example
 * const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks(user.id);
 * // Check if bookmarked
 * if (isBookmarked(event.id)) { ... }
 * // Toggle bookmark
 * toggleBookmark(event);
 */

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------
export const MAX_BOOKMARKS = 200;

const toBookmarkEntry = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  type: event?.type ?? event?.category ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  status: event?.status ?? "",
  savedAt: Date.now(),
});

const useBookmarks = (userId = "guest") => {
  const storageKey = `bookmarks_${userId}`;

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = safeGetItem(storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      safeSetItem(storageKey, JSON.stringify(bookmarks));
    } catch {
      // localStorage full — fail silently; in-memory state remains correct
    }
  }, [bookmarks, storageKey]);

  /**
   * Toggles bookmark state for an event.
   *
   * - If already bookmarked, removes the entry.
   * - If not, adds a minimal (non-full-object) entry.
   * - If adding would exceed MAX_BOOKMARKS, the oldest entry is dropped.
   *
   * Wrapped in useCallback so the reference is stable across renders.
   */
  const toggleBookmark = useCallback((event) => {
    if (!event?.id) return;

    setBookmarks((prev) => {
      const exists = prev.find((e) => e.id === event.id);

      if (exists) {
        return prev.filter((e) => e.id !== event.id);
      }

      const newEntry = toBookmarkEntry(event);
      const withNew = [...prev, newEntry];

      if (withNew.length <= MAX_BOOKMARKS) {
        return withNew;
      }

      // Cap exceeded: drop oldest entry (smallest savedAt) to stay within limit
      const sorted = [...withNew].sort((a, b) => (a.savedAt ?? 0) - (b.savedAt ?? 0));
      sorted.shift();
      return sorted;
    });
  }, []);

  /**
   * Returns true if an event with the given id is currently bookmarked.
   */
  const isBookmarked = useCallback(
    (id) => bookmarks.some((e) => e.id === id),
    [bookmarks],
  );

  /**
   * Removes all bookmarks for the current user from state and localStorage.
   */
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    try { safeRemoveItem(storageKey); } catch { /* non-fatal */ }
  }, [storageKey]);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
};

export default useBookmarks;
