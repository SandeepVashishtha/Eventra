import { safeJsonParse } from "./safeJsonParse.js";
const BOOKMARKS_STORAGE_KEY = "eventra_bookmarked_events";
const BOOKMARKS_CHANGED_EVENT = "eventraBookmarksChanged";

const normalizeEventId = (eventId) => String(eventId);

const readBookmarks = () => {
  if (typeof window === "undefined") return [];

  try {
    const rawBookmarks = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const parsedBookmarks =
      safeJsonParse(
        rawBookmarks,
        [],
      );
    return Array.isArray(parsedBookmarks) ? parsedBookmarks : [];
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
    // localStorage can be unavailable or full. Keep the UI usable if persistence fails.
  }
};

export const getBookmarkedEvents = () => readBookmarks();

export const isEventBookmarked = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  return readBookmarks().some((event) => normalizeEventId(event.id) === normalizedId);
};

export const addBookmarkedEvent = (event) => {
  const bookmarks = readBookmarks();
  const normalizedId = normalizeEventId(event.id);

  if (bookmarks.some((bookmarkedEvent) => normalizeEventId(bookmarkedEvent.id) === normalizedId)) {
    return bookmarks;
  }

  const nextBookmarks = [{ ...event, bookmarkedAt: new Date().toISOString() }, ...bookmarks];
  writeBookmarks(nextBookmarks);
  return nextBookmarks;
};

export const removeBookmarkedEvent = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  const nextBookmarks = readBookmarks().filter(
    (event) => normalizeEventId(event.id) !== normalizedId
  );

  writeBookmarks(nextBookmarks);
  return nextBookmarks;
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
