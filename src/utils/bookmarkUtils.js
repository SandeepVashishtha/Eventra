import { safeJsonParse } from "./safeJsonParse.js";

const BOOKMARKS_STORAGE_KEY = "eventra_bookmarked_events";
const BOOKMARKS_CHANGED_EVENT = "eventraBookmarksChanged";

export const MAX_BOOKMARKS = 200;

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
  }
};

export const getBookmarkedEvents = () => readBookmarks();

export const getBookmarkCount = () => readBookmarks().length;

export const isEventBookmarked = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  return readBookmarks().some((event) => normalizeEventId(event.id) === normalizedId);
};

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
    nextBookmarks = [...nextBookmarks].sort((a, b) => {
      const timeDiff = new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
      return timeDiff !== 0 ? timeDiff : String(a.id).localeCompare(String(b.id));
    });
    nextBookmarks.shift();
    nextBookmarks.sort(
      (a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime(),
    );
  }

  writeBookmarks(nextBookmarks);
  return nextBookmarks;
};

export const removeBookmarkedEvent = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  const nextBookmarks = readBookmarks().filter(
    (event) => normalizeEventId(event.id) !== normalizedId,
  );

  writeBookmarks(nextBookmarks);
  return nextBookmarks;
};

export const clearAllBookmarks = () => {
  writeBookmarks([]);
  return [];
};

export const pruneBookmarks = () => {
  const bookmarks = readBookmarks();
  if (bookmarks.length <= MAX_BOOKMARKS) return bookmarks;

  const sorted = [...bookmarks].sort(
    (a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime(),
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