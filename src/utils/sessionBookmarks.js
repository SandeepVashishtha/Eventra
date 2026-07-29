import { safeJsonParse } from "./safeJsonParse.js";

const SESSION_BOOKMARKS_KEY = "eventra_session_bookmarks";
const MAX_SESSION_BOOKMARKS = 50;

const readBookmarks = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_BOOKMARKS_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (bookmarks) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage may be unavailable
  }
};

export const addSessionBookmark = (event) => {
  if (!event?.id) return readBookmarks();
  const bookmarks = readBookmarks();
  if (bookmarks.some((b) => b.id === event.id)) return bookmarks;
  const entry = {
    id: event.id,
    title: event.title || "",
    url: event.url || "",
    addedAt: Date.now(),
  };
  const next = [entry, ...bookmarks];
  if (next.length > MAX_SESSION_BOOKMARKS) next.pop();
  writeBookmarks(next);
  return next;
};

export const removeSessionBookmark = (eventId) => {
  const next = readBookmarks().filter((b) => b.id !== eventId);
  writeBookmarks(next);
  return next;
};

export const getSessionBookmarks = () => readBookmarks();

export const isSessionBookmarked = (eventId) => {
  return readBookmarks().some((b) => b.id === eventId);
};

export const clearSessionBookmarks = () => {
  writeBookmarks([]);
  return [];
};
