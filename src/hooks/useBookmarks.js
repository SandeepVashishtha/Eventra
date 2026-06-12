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

  const [bookmarks, setBookmarks] = useState(() => {
    if (isAuthLoading) {
      return [];
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      const parsed = safeJsonParse(stored, {});
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [loadedKey, setLoadedKey] = useState(() => {
    return isAuthLoading ? null : storageKey;
  });

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

      const stored = localStorage.getItem(storageKey);
      let loaded = [];
      if (stored) {
        const parsed = safeJsonParse(stored, {});
        loaded = Array.isArray(parsed) ? parsed : [];
      }

      // If we just resolved a logged-in user, check if we need to migrate guest bookmarks
      if (resolvedUserId !== "guest" && hasGuestData) {
        const guestParsed = safeJsonParse(guestStored, {});
        const guestBookmarks = Array.isArray(guestParsed) ? guestParsed : [];
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
          localStorage.setItem(storageKey, JSON.stringify(loaded));
          // Delete guest storage ONLY after successful merge
          localStorage.removeItem(guestKey);
        }
      }

      setBookmarks(loaded);
      setLoadedKey(storageKey);
    } catch {
      setBookmarks([]);
      setLoadedKey(storageKey);
    }
  }, [storageKey, isAuthLoading, resolvedUserId, loadedKey]);

  useEffect(() => {
    if (isAuthLoading || loadedKey !== storageKey) {
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(bookmarks));
    } catch {
      // localStorage full — fail silently; in-memory state remains correct
    }
  }, [bookmarks, storageKey, isAuthLoading, loadedKey]);

  // Cache bookmarks in a Set for O(1) lookups
  const bookmarksSet = useMemo(() => {
    return new Set(bookmarks.map(e => e.id));
  }, [bookmarks]);

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
    (id) => bookmarksSet.has(id),
    [bookmarksSet],
  );

  /**
   * Removes all bookmarks for the current user from state and localStorage.
   */
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
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