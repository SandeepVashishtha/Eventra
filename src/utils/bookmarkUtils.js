import { safeJsonParse } from "./safeJsonParse.js";
import { apiUtils } from "../config/api";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_STORAGE_KEY = "eventra_bookmarked_events";
const BOOKMARKS_CHANGED_EVENT = "eventraBookmarksChanged";
const BROADCAST_CHANNEL_NAME = "eventra_bookmarks_sync_channel";
const SYNC_DEBOUNCE_MS = 2000;

export const MAX_BOOKMARKS = 200;

// Internal runtime state
let currentUserId = null;
let activeStorageKey = DEFAULT_STORAGE_KEY;
let cachedBookmarks = null; // In-memory read cache
let syncTimer = null;

// ============================================================================
// 2. SAFE STORAGE ENGINE (WITH IN-MEMORY FALLBACK)
// ============================================================================

class SafeStorageEngine {
  constructor() {
    this.memoryStore = new Map();
  }

  getItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("[bookmarkService] LocalStorage access blocked, using memory fallback.");
    }
    return this.memoryStore.get(key) || null;
  }

  setItem(key, value) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn("[bookmarkService] Storage write failed or quota exceeded.", e);
    }
    this.memoryStore.set(key, value);
    return false;
  }

  removeItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    this.memoryStore.delete(key);
  }
}

const safeStorage = new SafeStorageEngine();

// ============================================================================
// 3. BROADCAST & EVENT SUBSCRIBERS
// ============================================================================

const subscribers = new Set();

let broadcastChannel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === "BOOKMARKS_UPDATED") {
        cachedBookmarks = event.data.bookmarks;
        notifySubscribers(cachedBookmarks, false);
      }
    };
  } catch (e) {
    broadcastChannel = null;
  }
}

const notifySubscribers = (bookmarks, emitCrossTab = true) => {
  // 1. In-App Subscribers
  subscribers.forEach((cb) => {
    try {
      cb(bookmarks);
    } catch (e) {
      console.error("[bookmarkService] Subscriber notification error:", e);
    }
  });

  // 2. Window Custom Event
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(BOOKMARKS_CHANGED_EVENT, { detail: bookmarks })
      );
    } catch (e) {}
  }

  // 3. Cross-Tab Broadcast Channel
  if (emitCrossTab && broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: "BOOKMARKS_UPDATED",
        bookmarks,
        userId: currentUserId,
      });
    } catch (e) {}
  }
};

// ============================================================================
// 4. HELPER & NORMALIZATION FUNCTIONS
// ============================================================================

const normalizeEventId = (eventId) => String(eventId);

/**
 * Minimal bookmark shape builder
 */
const toBookmarkEntry = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  type: event?.type ?? event?.category ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  status: event?.status ?? "",
  bookmarkedAt: event?.bookmarkedAt || new Date().toISOString(),
});

// ============================================================================
// 5. CACHED READ / WRITE PERSISTENCE
// ============================================================================

const readBookmarksFromStorage = () => {
  if (cachedBookmarks !== null) {
    return cachedBookmarks;
  }

  const rawBookmarks = safeStorage.getItem(activeStorageKey);
  const parsed = safeJsonParse(rawBookmarks, []);
  const validArray = Array.isArray(parsed) ? parsed : [];

  cachedBookmarks = validArray;
  return cachedBookmarks;
};

const writeBookmarksToStorage = (bookmarks) => {
  cachedBookmarks = bookmarks;
  safeStorage.setItem(activeStorageKey, JSON.stringify(bookmarks));
  notifySubscribers(bookmarks, true);
  scheduleServerSync();
};

// ============================================================================
// 6. SERVER SYNC ENGINE
// ============================================================================

const scheduleServerSync = () => {
  if (!currentUserId) return; // Only sync authenticated user profiles
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(syncBookmarksWithServer, SYNC_DEBOUNCE_MS);
};

/**
 * Syncs local bookmark list with backend database
 */
export const syncBookmarksWithServer = async () => {
  if (!currentUserId) return;

  try {
    const currentList = readBookmarksFromStorage();
    const response = await apiUtils.post("/api/bookmarks/sync", {
      userId: currentUserId,
      bookmarks: currentList,
    });

    // If server responds with updated/merged list, sync locally
    if (response && response.data && Array.isArray(response.data.bookmarks)) {
      cachedBookmarks = response.data.bookmarks;
      safeStorage.setItem(activeStorageKey, JSON.stringify(cachedBookmarks));
      notifySubscribers(cachedBookmarks, false);
    }
  } catch (error) {
    console.warn("[bookmarkService] Background server sync failed. Retrying on next change.", error);
  }
};

// ============================================================================
// 7. USER CONTEXT & BUCKET SWITCHING
// ============================================================================

/**
 * Sets the active user context and switches storage keys
 * @param {string|null} userId
 */
export const setUserContext = (userId = null) => {
  currentUserId = userId;
  activeStorageKey = userId ? `bookmarks_${userId}` : DEFAULT_STORAGE_KEY;
  cachedBookmarks = null; // Invalidate cache on account switch
  
  // Read new context
  const bookmarks = readBookmarksFromStorage();
  notifySubscribers(bookmarks, false);
};

// ============================================================================
// 8. CORE PUBLIC APIS (FULL BACKWARD COMPATIBILITY)
// ============================================================================

export const getBookmarkedEvents = () => readBookmarksFromStorage();

export const getBookmarkCount = () => readBookmarksFromStorage().length;

export const isEventBookmarked = (eventId) => {
  if (!eventId) return false;
  const normalizedId = normalizeEventId(eventId);
  return readBookmarksFromStorage().some(
    (event) => normalizeEventId(event.id) === normalizedId
  );
};

/**
 * Add an event to the bookmark list.
 * @param {object} event - The event to bookmark.
 * @returns {Array} The updated bookmark list.
 */
export const addBookmarkedEvent = (event) => {
  if (!event?.id) return readBookmarksFromStorage();

  const bookmarks = readBookmarksFromStorage();
  const normalizedId = normalizeEventId(event.id);

  if (bookmarks.some((b) => normalizeEventId(b.id) === normalizedId)) {
    return bookmarks;
  }

  const entry = toBookmarkEntry(event);
  let nextBookmarks = [entry, ...bookmarks];

  if (nextBookmarks.length > MAX_BOOKMARKS) {
    // Sort oldest-first and drop the oldest entry to stay within limit
    nextBookmarks = [...nextBookmarks].sort((a, b) => {
      const timeDiff =
        new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
      return timeDiff !== 0 ? timeDiff : String(a.id).localeCompare(String(b.id));
    });
    nextBookmarks.shift();

    // Re-sort newest-first
    nextBookmarks.sort(
      (a, b) =>
        new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
    );
  }

  writeBookmarksToStorage(nextBookmarks);
  return nextBookmarks;
};

/**
 * Remove a single bookmark by event ID.
 * @param {string|number} eventId
 * @returns {Array} The updated bookmark list.
 */
export const removeBookmarkedEvent = (eventId) => {
  if (!eventId) return readBookmarksFromStorage();

  const normalizedId = normalizeEventId(eventId);
  const nextBookmarks = readBookmarksFromStorage().filter(
    (event) => normalizeEventId(event.id) !== normalizedId
  );

  writeBookmarksToStorage(nextBookmarks);
  return nextBookmarks;
};

/**
 * Toggles a bookmark on or off atomically
 * @param {object} event
 * @returns {boolean} True if now bookmarked, False if removed
 */
export const toggleBookmark = (event) => {
  if (!event?.id) return false;
  if (isEventBookmarked(event.id)) {
    removeBookmarkedEvent(event.id);
    return false;
  } else {
    addBookmarkedEvent(event);
    return true;
  }
};

/**
 * Remove all bookmarks.
 * @returns {Array} Empty array.
 */
export const clearAllBookmarks = () => {
  writeBookmarksToStorage([]);
  return [];
};

/**
 * Enforce MAX_BOOKMARKS cap on stored list.
 * @returns {Array} Pruned list.
 */
export const pruneBookmarks = () => {
  const bookmarks = readBookmarksFromStorage();
  if (bookmarks.length <= MAX_BOOKMARKS) return bookmarks;

  const sorted = [...bookmarks].sort(
    (a, b) =>
      new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
  );
  const pruned = sorted.slice(0, MAX_BOOKMARKS);
  writeBookmarksToStorage(pruned);
  return pruned;
};

/**
 * Subscribe to bookmark changes
 */
export const subscribeToBookmarkChanges = (callback) => {
  if (typeof callback !== "function") return () => {};

  subscribers.add(callback);

  const handleStorageChange = (event) => {
    if (event.key === activeStorageKey) {
      cachedBookmarks = null; // Invalidate cache
      const updated = readBookmarksFromStorage();
      callback(updated);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageChange);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
};

// ============================================================================
// 9. BATCH & QUERY ENGINE
// ============================================================================

/**
 * Adds multiple events at once atomically
 * @param {Array<object>} eventsArray
 * @returns {Array} Updated bookmark list
 */
export const addMultipleBookmarks = (eventsArray = []) => {
  if (!Array.isArray(eventsArray) || eventsArray.length === 0) {
    return readBookmarksFromStorage();
  }

  let currentList = [...readBookmarksFromStorage()];
  const existingIds = new Set(currentList.map((b) => normalizeEventId(b.id)));

  eventsArray.forEach((event) => {
    if (event?.id && !existingIds.has(normalizeEventId(event.id))) {
      currentList.unshift(toBookmarkEntry(event));
      existingIds.add(normalizeEventId(event.id));
    }
  });

  if (currentList.length > MAX_BOOKMARKS) {
    currentList = currentList
      .sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime())
      .slice(0, MAX_BOOKMARKS);
  }

  writeBookmarksToStorage(currentList);
  return currentList;
};

/**
 * Client-side local search, filter, and pagination engine over bookmarks
 * @param {object} params - { search, type, sortBy, page, limit }
 * @returns {object} { data, total, page, totalPages }
 */
export const queryBookmarks = (params = {}) => {
  const {
    search = "",
    type = "all",
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = params;

  let dataset = [...readBookmarksFromStorage()];

  // 1. Search Query
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    dataset = dataset.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
    );
  }

  // 2. Type / Category Filter
  if (type !== "all") {
    dataset = dataset.filter((b) => b.type.toLowerCase() === type.toLowerCase());
  }

  // 3. Sorting
  dataset.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
      case "eventDate":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "newest":
      default:
        return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
    }
  });

  // 4. Pagination
  const total = dataset.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = dataset.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total,
    page: currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Exports bookmarks as a downloadable JSON string
 */
export const exportBookmarksJSON = () => {
  return JSON.stringify(readBookmarksFromStorage(), null, 2);
};

/**
 * Imports bookmarks from JSON string with deduplication
 */
export const importBookmarksJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return addMultipleBookmarks(parsed);
    }
  } catch (e) {
    console.error("[bookmarkService] Failed to import bookmarks JSON:", e);
  }
  return readBookmarksFromStorage();
};
