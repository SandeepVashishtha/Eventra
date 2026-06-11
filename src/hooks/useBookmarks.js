/**
 * @fileoverview useBookmarks - Event bookmarks management hook
 * @module hooks/useBookmarks
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";

// Simple synchronous hash to avoid exposing raw userId (email) in localStorage keys.
const hashUserId = (userId) => {
  if (!userId || userId === "guest") return "guest";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const chr = userId.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------
export const MAX_BOOKMARKS = 200;

// ---------------------------------------------------------------------------
// Module-level cache
//
// Keyed by storageKey (e.g. "bookmarks_user123"). Shared across all hook
// instances mounted at the same time, so multiple components calling
// useBookmarks(userId) read from and write to one in-memory array instead of
// each independently parsing localStorage on every render cycle.
// ---------------------------------------------------------------------------
const cache = new Map(); // Map<storageKey, BookmarkEntry[]>

const readStorage = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded — in-memory state remains correct
  }
};

const getOrPopulateCache = (key) => {
  if (!cache.has(key)) {
    cache.set(key, readStorage(key));
  }
  return cache.get(key);
};

// ---------------------------------------------------------------------------
// Entry shape
// ---------------------------------------------------------------------------
const toBookmarkEntry = (event) => ({
  id: event.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  type: event?.type ?? event?.category ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  status: event?.status ?? "",
  savedAt: Date.now(),
});

/**
 * A custom React hook that manages bookmarked events for a user,
 * persisting them to localStorage keyed by userId.
 *
 * Multiple components mounting useBookmarks(userId) share one in-memory
 * cache entry, so localStorage is read at most once per userId per session
 * instead of once per mount. Cross-tab changes are reflected via the native
 * `storage` event.
 *
 * @param {string} [userId='guest'] - The user ID used as localStorage key
 *
 * @returns {{
 *   bookmarks: Object[],
 *   toggleBookmark: (event: Object) => void,
 *   isBookmarked: (id: string|number) => boolean,
 *   clearBookmarks: () => void,
 * }}
 *
 * @example
 * const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks(user.id);
 * if (isBookmarked(event.id)) { ... }
 * toggleBookmark(event);
 */
const useBookmarks = (userId = "guest") => {
  const storageKey = `bookmarks_${hashUserId(userId)}`;

  // Seed state from cache (avoids a second localStorage read when the cache
  // is already warm from another mounted instance or a previous render).
  const [bookmarks, setBookmarks] = useState(() => getOrPopulateCache(storageKey));

  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // When userId changes, pull the new user's bookmarks out of cache / storage.
  useEffect(() => {
    setBookmarks(getOrPopulateCache(storageKey));
  }, [storageKey]);
  const isInitialSave = useRef(true);

  // Persist to localStorage and update the shared cache whenever state changes.
  const prevBookmarksRef = useRef(null);
  useEffect(() => {
    // Skip write on the very first render (data came from cache/storage already)
    if (prevBookmarksRef.current === null) {
      prevBookmarksRef.current = bookmarks;
    }
    if (isInitialSave.current) {
      isInitialSave.current = false;
      return;
    }
    if (prevBookmarksRef.current === bookmarks) return;
    prevBookmarksRef.current = bookmarks;

    cache.set(storageKeyRef.current, bookmarks);
    writeStorage(storageKeyRef.current, bookmarks);
  }, [bookmarks]);

  // Cross-tab sync: update state when another tab writes to the same key.
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;

  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key !== storageKeyRef.current) return;
      const fresh = e.newValue ? (() => {
        try { 
          const p = JSON.parse(e.newValue); 
          if (!Array.isArray(p)) return [];
          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt
          const merged = new Map([...bookmarksRef.current.map(b => [b.id, b]), ...p.map(b => [b.id, b])]);
          return Array.from(merged.values()).sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));
        } catch { return []; }
      })() : [];
      cache.set(storageKeyRef.current, fresh);
      setBookmarks(fresh);
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  // Cache bookmarks in a Set for O(1) lookups
  const bookmarksSet = useMemo(() => {
    return new Set(bookmarks.map(e => e.id));
  }, [bookmarks]);

  /**
   * Toggles bookmark state for an event.
   *
   * - If already bookmarked, removes the entry.
   * - If not, appends a minimal entry.
   * - If adding would exceed MAX_BOOKMARKS, the oldest entry (smallest
   *   savedAt) is evicted first.
   */
  const toggleBookmark = useCallback((event) => {
    if (!event?.id) return;

    setBookmarks((prev) => {
      const exists = prev.some((e) => e.id === event.id);

      if (exists) {
        return prev.filter((e) => e.id !== event.id);
      }

      const withNew = [...prev, toBookmarkEntry(event)];

      if (withNew.length <= MAX_BOOKMARKS) return withNew;

      // Evict the oldest entry to stay within the cap
      const sorted = [...withNew].sort((a, b) => (a.savedAt ?? 0) - (b.savedAt ?? 0));
      sorted.shift();
      return sorted;
    });
  }, []);

  /**
   * Returns true if an event with the given id is currently bookmarked.
   */
  const isBookmarked = useCallback(
    (id) => bookmarksSet.has(id),
    [bookmarksSet],
  );

  /**
   * Removes all bookmarks for the current user from both state and localStorage.
   */
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    cache.set(storageKeyRef.current, []);
    try {
      localStorage.removeItem(storageKeyRef.current);
    } catch {
      // ignore
    }
  }, []);

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
  };
};

export default useBookmarks;