import { get, set, del, clear } from 'idb-keyval';

// In-memory cache fallback when IndexedDB is blocked (e.g., in private windows)
const memoryCache = new Map();
let isIndexedDbFunctional = true;

/**
 * Saves a serializable payload to IndexedDB securely, falling back to in-memory store if disabled.
 * @param {string} key 
 * @param {any} val 
 * @returns {Promise<void>}
 */
export const saveToOfflineCache = async (key, val) => {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      if (quota > 0 && usage / quota > 0.95) {
        console.warn("[IndexedDB] Storage quota is running extremely low (over 95% full).");
      }
    } catch {}
  }
  if (isIndexedDbFunctional) {
    try {
      await set(key, val);
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to save key "${key}". Falling back to memory:`, err);
      isIndexedDbFunctional = false;
    }
  }
  memoryCache.set(key, val);
};

/**
 * Retrieves a payload from IndexedDB, falling back to in-memory store if disabled.
 * @param {string} key 
 * @param {any} fallback 
 * @returns {Promise<any>}
 */
export const getFromOfflineCache = async (key, fallback = null) => {
  if (isIndexedDbFunctional) {
    try {
      const val = await get(key);
      return val !== undefined ? val : fallback;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to read key "${key}". Falling back to memory:`, err);
      isIndexedDbFunctional = false;
    }
  }
  const memVal = memoryCache.get(key);
  return memVal !== undefined ? memVal : fallback;
};

/**
 * Deletes a specific key from IndexedDB, falling back to in-memory store if disabled.
 * @param {string} key 
 * @returns {Promise<void>}
 */
export const removeFromOfflineCache = async (key) => {
  if (isIndexedDbFunctional) {
    try {
      await del(key);
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to delete key "${key}". Falling back to memory:`, err);
      isIndexedDbFunctional = false;
    }
  }
  memoryCache.delete(key);
};

/**
 * Clears the entire IndexedDB cache for this origin, falling back to in-memory store if disabled.
 * Use cautiously.
 * @returns {Promise<void>}
 */
export const clearOfflineCache = async () => {
  if (isIndexedDbFunctional) {
    try {
      await clear();
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to clear cache. Falling back to memory:`, err);
      isIndexedDbFunctional = false;
    }
  }
  memoryCache.clear();
};
