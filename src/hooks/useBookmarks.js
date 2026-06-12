/**
 * @fileoverview useBookmarks - Event bookmarks management hook
 * @module hooks/useBookmarks
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";
import { useAuth } from "../context/AuthContext";

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

export const MAX_BOOKMARKS = 200;

// ---------------------------------------------------------------------------
// Module-level cache
//
// Keyed by storageKey (e.g. "bookmarks_user123"). Shared across all hook
// instances mounted at the same time, so multiple components calling
// useBookmarks(userId) read from and write to one in-memory array instead of
// each independently parsing localStorage on every render cycle.
// ---------------------------------------------------------------------------
export const _cache = new Map(); // Map<storageKey, BookmarkEntry[]>
const cache = _cache;

const readStorage = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = safeJsonParse(stored, []);
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
 * @param {string} [userId='guest'] - The user ID used as localStorage key
 */
const useBookmarks = (userId = "guest") => {
  let auth = null;
  try {
    auth = useAuth();
  } catch {
    // context not present, e.g. in standalone hook unit tests
  }

  const resolvedUserId = useMemo(() => {
    if (auth) {
      if (auth.isAuthenticated && auth.user) {
        return auth.user.id || auth.user.email || "guest";
      }
      return "guest";
    }
    return userId;
  }, [auth, userId]);

  const isAuthLoading = auth ? auth.loading : false;
  const storageKey = `bookmarks_${hashUserId(resolvedUserId)}`;

  // Seed state from cache (avoids a second localStorage read when the cache
  // is already warm from another mounted instance or a previous render).
  const [bookmarks, setBookmarks] = useState(() => {
    if (isAuthLoading) {
      return [];
    }
    return getOrPopulateCache(storageKey);
  });

  const [loadedKey, setLoadedKey] = useState(() => {
    return isAuthLoading ? null : storageKey;
  });

  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  const prevBookmarksRef = useRef(null);
  const isInitialSave = useRef(true);

  // When userId changes, pull the new user's bookmarks out of cache / storage.
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    try {
      // Check if we need to load/migrate or if we already initialized matching key
      const guestKey = `bookmarks_${hashUserId("guest")}`;
      const guestStored = localStorage.getItem(guestKey);
      const hasGuestData = guestStored && (safeJsonParse(guestStored, [])).length > 0;

      if (loadedKey === storageKey && (resolvedUserId === "guest" || !hasGuestData)) {
        return;
      }

      let loaded = getOrPopulateCache(storageKey);

      // If we just resolved a logged-in user, check if we need to migrate guest bookmarks
      if (resolvedUserId !== "guest" && hasGuestData) {
        const guestBookmarks = getOrPopulateCache(guestKey);
        if (guestBookmarks.length > 0) {
          // Merge guest bookmarks into loaded bookmarks
          const merged = [...loaded];
          guestBookmarks.forEach((gb) => {
            const existsIndex = merged.findIndex((ub) => String(ub.id) === String(gb.id));
            if (existsIndex === -1) {
              merged.push(gb);
            } else {
              const uSaved = merged[existsIndex].savedAt ?? 0;
              const gSaved = gb.savedAt ?? 0;
              if (gSaved > uSaved) {
                merged[existsIndex] = gb;
              }
            }
          });

          // Enforce MAX_BOOKMARKS on merged result
          let finalMerged = merged;
          if (finalMerged.length > MAX_BOOKMARKS) {
            finalMerged = [...finalMerged].sort((a, b) => (a.savedAt ?? 0) - (b.savedAt ?? 0));
            while (finalMerged.length > MAX_BOOKMARKS) {
              finalMerged.shift();
            }
          }

          loaded = finalMerged;
          // Save to user storage
          cache.set(storageKey, loaded);
          writeStorage(storageKey, loaded);
          // Delete guest storage ONLY after successful merge
          cache.delete(guestKey);
          localStorage.removeItem(guestKey);
        }
      }

      prevBookmarksRef.current = loaded;
      setBookmarks(loaded);
      setLoadedKey(storageKey);
    } catch {
      setBookmarks([]);
      setLoadedKey(storageKey);
    }
  }, [storageKey, isAuthLoading, resolvedUserId, loadedKey]);

  // Persist to localStorage and update the shared cache whenever state changes.
  useEffect(() => {
    if (isAuthLoading || loadedKey !== storageKey) {
      return;
    }
    // Skip write on the very first render cycle
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
  }, [bookmarks, isAuthLoading, loadedKey, storageKey]);

  // Cross-tab sync: update state when another tab writes to the same key.
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key !== storageKeyRef.current) return;
      if (isAuthLoading || loadedKey !== storageKeyRef.current) return;

      const fresh = e.newValue ? (() => {
        try { 
          const p = JSON.parse(e.newValue); 
          if (!Array.isArray(p)) return [];
          // Deep merge: combine existing local state with incoming storage state, keeping newest by savedAt
          const merged = new Map([...bookmarks.map(b => [b.id, b]), ...p.map(b => [b.id, b])]);
          return Array.from(merged.values()).sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));
        } catch { return []; }
      })() : [];
      cache.set(storageKeyRef.current, fresh);
      prevBookmarksRef.current = fresh;
      setBookmarks(fresh);
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [bookmarks, isAuthLoading, loadedKey]);

  // Cache bookmarks in a Set for O(1) lookups
  const bookmarksSet = useMemo(() => {
    return new Set(bookmarks.map(e => e.id));
  }, [bookmarks]);

  /**
   * Toggles bookmark state for an event.
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

      // Evict the oldest entry to stay within the cap limits
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
      // ignore storage access blocks
    }
  }, []);

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    loading: isAuthLoading || loadedKey !== storageKey,
  };
};

export default useBookmarks;