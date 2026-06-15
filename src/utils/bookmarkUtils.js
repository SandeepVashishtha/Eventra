import { safeJsonParse } from "./safeJsonParse.js";

const BOOKMARKS_STORAGE_KEY = "bookmarks_guest";
const BOOKMARKS_CHANGED_EVENT = "eventraBookmarksChanged";

// ---------------------------------------------------------------------------
// Limits
//
// MAX_BOOKMARKS caps the number of entries in the `bookmarks_guest`
// localStorage key to prevent quota exhaustion.
//
// When the cap is exceeded the oldest entry (smallest savedAt/bookmarkedAt) is dropped
// so the total stays within bounds.
// ---------------------------------------------------------------------------
export const MAX_BOOKMARKS = 200;

// ---------------------------------------------------------------------------
// Minimal bookmark shape
//
// Keep both savedAt (timestamp) and bookmarkedAt (ISO string) for compatibility
// with both useBookmarks and existing legacy unit tests.
// ---------------------------------------------------------------------------
const toBookmarkEntry = (event) => {
  const now = Date.now();
  return {
    id: event?.id,
    title: event?.title ?? "",
    date: event?.date ?? "",
    location: event?.location ?? "",
    type: event?.type ?? event?.category ?? "",
    image: event?.image ?? event?.imageUrl ?? "",
    status: event?.status ?? "",
    savedAt: event?.savedAt ?? now,
    bookmarkedAt: event?.bookmarkedAt ?? new Date(now).toISOString(),
  };
};

const normalizeEventId = (eventId) => String(eventId);

const readBookmarks = () => {
  if (typeof window === "undefined") return [];

  try {
    const rawBookmarks = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const parsed = safeJsonParse(rawBookmarks, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (bookmarks) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    window.dispatchEvent(
      new CustomEvent(BOOKMARKS_CHANGED_EVENT, {
        detail: { key: BOOKMARKS_STORAGE_KEY, value: bookmarks },
      })
    );
  } catch {
    // localStorage can be unavailable or full — keep the UI usable if persistence fails
  }
};

export const getBookmarkedEvents = () => readBookmarks();

export const getBookmarkCount = () => readBookmarks().length;

export const isEventBookmarked = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  return readBookmarks().some((event) => normalizeEventId(event.id) === normalizedId);
};

/**
 * Add an event to the bookmark list.
 *
 * - Skips duplicate IDs (idempotent).
 * - Stores only the minimal display fields — not the full event object.
 * - If the list would exceed MAX_BOOKMARKS, drops the oldest entry first.
 *
 * @param {object} event - The event to bookmark.
 * @returns {Array} The updated bookmark list.
 */
export const addBookmarkedEvent = (event) => {
  if (!event?.id) return readBookmarks();

  const bookmarks = readBookmarks();
  const normalizedId = normalizeEventId(event.id);

  if (bookmarks.some((b) => normalizeEventId(b.id) === normalizedId)) {
    return bookmarks;
  }

  const entry = toBookmarkEntry(event);
  let nextBookmarks = [entry, ...bookmarks];

  if (nextBookmarks.length > MAX_BOOKMARKS) {
    // Sort oldest-first and drop the last (oldest) entry to stay within limit
    nextBookmarks = [...nextBookmarks].sort((a, b) => {
      const aTime = a.savedAt || new Date(a.bookmarkedAt).getTime();
      const bTime = b.savedAt || new Date(b.bookmarkedAt).getTime();
      const timeDiff = aTime - bTime;
      return timeDiff !== 0 ? timeDiff : String(a.id).localeCompare(String(b.id));
    });
    nextBookmarks.shift();
    // Re-sort newest-first for consistent read order
    nextBookmarks.sort((a, b) => {
      const aTime = a.savedAt || new Date(a.bookmarkedAt).getTime();
      const bTime = b.savedAt || new Date(b.bookmarkedAt).getTime();
      return bTime - aTime;
    });
  }

  writeBookmarks(nextBookmarks);
  return nextBookmarks;
};

/**
 * Remove a single bookmark by event ID.
 *
 * @param {string|number} eventId
 * @returns {Array} The updated bookmark list.
 */
export const removeBookmarkedEvent = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  const nextBookmarks = readBookmarks().filter(
    (event) => normalizeEventId(event.id) !== normalizedId,
  );

  writeBookmarks(nextBookmarks);
  return nextBookmarks;
};

/**
 * Remove all bookmarks, clearing both in-memory state and localStorage.
 *
 * @returns {Array} Empty array.
 */
export const clearAllBookmarks = () => {
  writeBookmarks([]);
  return [];
};

/**
 * Enforce the MAX_BOOKMARKS cap on the existing stored list.
 * Call this on app startup to prune any legacy over-limit entries.
 *
 * @returns {Array} The pruned bookmark list (or original if within limit).
 */
export const pruneBookmarks = () => {
  const bookmarks = readBookmarks();
  if (bookmarks.length <= MAX_BOOKMARKS) return bookmarks;

  const sorted = [...bookmarks].sort((a, b) => {
    const aTime = a.savedAt || new Date(a.bookmarkedAt).getTime();
    const bTime = b.savedAt || new Date(b.bookmarkedAt).getTime();
    return bTime - aTime;
  });
  const pruned = sorted.slice(0, MAX_BOOKMARKS);
  writeBookmarks(pruned);
  return pruned;
};

export const subscribeToBookmarkChanges = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleLocalChange = (event) => {
    const detail = event?.detail;
    if (detail && detail.key === BOOKMARKS_STORAGE_KEY) {
      callback(detail.value || []);
    } else if (Array.isArray(detail)) {
      callback(detail);
    } else {
      callback(readBookmarks());
    }
  };

  const handleStorageChange = (event) => {
    if (event.key === BOOKMARKS_STORAGE_KEY) {
      callback(readBookmarks());
    }
  };

  window.addEventListener(BOOKMARKS_CHANGED_EVENT, handleLocalChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(BOOKMARKS_CHANGED_EVENT, handleLocalChange);
    window.removeEventListener("storage", handleStorageChange);
  };
};
