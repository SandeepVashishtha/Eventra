import { safeJsonParse } from "./safeJsonParse.js";

const BOOKMARKS_STORAGE_KEY = "eventra_bookmarked_events";
const BOOKMARKS_CHANGED_EVENT = "eventraBookmarksChanged";

// ---------------------------------------------------------------------------
// Limits
//
// MAX_BOOKMARKS caps the number of entries in the `eventra_bookmarked_events`
// localStorage key to prevent quota exhaustion. This is a separate code path
// from useBookmarks.js (which uses `bookmarks_<userId>` keys). Both must
// enforce the same cap independently.
//
// When the cap is exceeded the oldest entry (smallest bookmarkedAt) is dropped
// so the total stays within bounds.
// ---------------------------------------------------------------------------
export const MAX_BOOKMARKS = 200;

// ---------------------------------------------------------------------------
// Minimal bookmark shape
//
// Previously: { ...event, bookmarkedAt }  — the full event object spread
// Now: only the fields needed to render the bookmarks list and navigate
// to the event detail page. The full event is fetched on demand when the
// user opens the event.
// ---------------------------------------------------------------------------
const toBookmarkEntry = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  type: event?.type ?? event?.category ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  status: event?.status ?? "",
  bookmarkedAt: new Date().toISOString(),
});

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
    window.dispatchEvent(new CustomEvent(BOOKMARKS_CHANGED_EVENT, { detail: bookmarks }));
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
      const timeDiff = new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
      return timeDiff !== 0 ? timeDiff : String(a.id).localeCompare(String(b.id));
    });
    nextBookmarks.shift();
    // Re-sort newest-first for consistent read order
    nextBookmarks.sort(
      (a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
    );
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
    (event) => normalizeEventId(event.id) !== normalizedId
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

  const sorted = [...bookmarks].sort(
    (a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
  );
  const pruned = sorted.slice(0, MAX_BOOKMARKS);
  writeBookmarks(pruned);
  return pruned;
};

export const subscribeToBookmarkChanges = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleLocalChange = (event) => {
    callback(Array.isArray(event.detail) ? event.detail : readBookmarks());
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
