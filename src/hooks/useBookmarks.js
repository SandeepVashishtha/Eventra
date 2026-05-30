import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Limits
//
// MAX_BOOKMARKS caps the number of entries stored in localStorage to prevent
// quota exhaustion. Storing full event objects (potentially several KB each)
// without a count limit could fill the 5-10 MB per-origin localStorage
// budget and cause all subsequent writes (offline queue, auth, session) to
// fail silently.
//
// When the limit is reached the oldest bookmark (smallest savedAt) is dropped
// to make room for the new one, implementing a least-recently-saved policy.
// ---------------------------------------------------------------------------
export const MAX_BOOKMARKS = 200;

// ---------------------------------------------------------------------------
// Minimal bookmark shape
//
// The previous implementation stored the entire event object spread:
//   { ...event, savedAt: Date.now() }
//
// Large event objects can be several kilobytes. At 200 entries that is
// 1–2 MB of localStorage consumed only by bookmarks. The minimal shape
// retains only the fields needed to render the bookmarks list and navigate
// to the event detail page. Full event data is fetched from the API when
// the user opens the event.
// ---------------------------------------------------------------------------
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
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(bookmarks));
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
    try { localStorage.removeItem(storageKey); } catch { /* non-fatal */ }
  }, [storageKey]);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
};

export default useBookmarks;