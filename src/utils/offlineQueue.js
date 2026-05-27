// ---------------------------------------------------------------------------
// Self-Healing Offline Queue Utility (IndexedDB backed with LocalStorage Backup)
// ---------------------------------------------------------------------------

const QUEUE_KEY = 'eventra_offline_queue';
const DB_NAME = 'eventra_offline_db';
const STORE_NAME = 'actions_queue';
const DB_VERSION = 1;

// Open Promise-based IndexedDB connection
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Read the current offline queue from localStorage (Synchronous fallback).
 */
export const getQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Read the current offline queue from IndexedDB (Asynchronous core).
 */
export const getQueueIndexedDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB getQueue failed, falling back to localStorage:", err);
    return getQueue();
  }
};

/**
 * generateQueueId
 *
 * Generates a collision-free ID for a new offline queue item.
 *
 * Why the previous implementation was unreliable
 * ───────────────────────────────────────────────
 * The previous expression was:
 *
 *   Date.now() + Math.random().toString(36).substring(2, 7)
 *
 * This had two problems:
 *
 *  1. String coercion ambiguity: the result of Date.now() (a number) was
 *     concatenated with a string via implicit coercion. The expression worked
 *     by accident but is fragile and non-obvious.
 *
 *  2. Collision risk under rapid submissions: Date.now() returns the same
 *     millisecond timestamp for two events queued in the same tick (e.g. a
 *     double-tap or a rapid programmatic batch). With only 5 random characters
 *     from a 36-character alphabet (36^5 ≈ 60 million), collision probability
 *     is non-trivial under load. A collision causes the second IndexedDB put()
 *     to silently overwrite the first item (keyPath: 'id'), losing one action.
 *
 * Fix
 * ───
 * Use crypto.randomUUID() which produces a RFC 4122 v4 UUID — 122 bits of
 * random data, guaranteed unique by the Web Crypto API. Falls back to a
 * manually composed UUID-like string with 9 random characters (vs the previous
 * 5) for environments where crypto.randomUUID is unavailable (older browsers).
 *
 * @returns {string} A collision-resistant unique ID string
 */
const generateQueueId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + 9 random base-36 chars (36^9 ≈ 101 billion combinations)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Append a single item to both localStorage mirror and IndexedDB.
 */
export const pushToQueue = async (item) => {
  // Add metadata tracking
  const actionItem = {
    id: item.id || generateQueueId(),
    timestamp: item.timestamp || new Date().toISOString(),
    retryCount: item.retryCount || 0,
    actionType: item.actionType || "REGISTER_EVENT",
    eventId: item.eventId || null,
    payload: item.payload || {},
    endpoint: item.endpoint || null
  };

  // 1. Sync mirror updates immediately (Synchronous fallback)
  const queue = getQueue();
  if (queue.length >= 15) {
    console.warn('Offline queue limit reached. Dropping item to prevent local overflow.');
    return false;
  }
  queue.push(actionItem);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error writing localStorage backup:', error);
    return false;
  }

  // 2. Async IndexedDB background write
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(actionItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    return true;
  } catch (err) {
    console.error("IndexedDB push failed:", err);
    return true; // Still queued in localStorage fallback
  }
};

/**
 * Overwrite the queue in both storages (Used after resolving conflicts or updates).
 */
export const setQueue = async (newQueue) => {
  // 1. Sync mirror updates immediately
  try {
    if (newQueue.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    }
  } catch (error) {
    console.error('Error setting localStorage backup:', error);
  }

  // 2. Sync IndexedDB in background
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        if (newQueue.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        newQueue.forEach(item => {
          const putReq = store.add(item);
          putReq.onsuccess = () => {
            completed++;
            if (completed === newQueue.length) resolve();
          };
          putReq.onerror = () => reject(putReq.error);
        });
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (err) {
    console.error("IndexedDB setQueue failed:", err);
  }
};

/**
 * Clear all offline actions from database and localStorage.
 */
export const clearQueue = async () => {
  // 1. Sync mirror
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage backup:', error);
  }

  // 2. Sync IndexedDB
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB clear failed:", err);
  }
};
