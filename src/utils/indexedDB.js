import { get, set, del, clear } from 'idb-keyval';

// In-memory cache fallback when IndexedDB is blocked (e.g., in private windows)
const memoryCache = new Map();
let isIndexedDbFunctional = true;
let lastQuotaCheck = 0;

const MAX_MEM_CACHE_SIZE = 500;
const QUOTA_CHECK_INTERVAL_MS = 10000; // Check storage quota at most once every 10s

/**
 * Periodically estimates storage quota to avoid synchronous I/O overhead on every write.
 */
const checkStorageQuota = async () => {
  const now = Date.now();
  if (now - lastQuotaCheck < QUOTA_CHECK_INTERVAL_MS) return;
  lastQuotaCheck = now;

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
};

/**
 * Self-healing helper that retries IndexedDB operations on transient locking or transaction errors
 * before resorting to in-memory fallback.
 */
const executeWithRetry = async (operation, retries = 2, delayMs = 50) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      const isTransient = err.name === "AbortError" ||
                          err.name === "TransactionInactiveError" ||
                          err.name === "UnknownError" ||
                          err.name === "ConstraintError" ||
                          err.message?.toLowerCase().includes("transient") ||
                          err.message?.toLowerCase().includes("lock");

      if (isTransient && attempt < retries) {
        console.warn(`[IndexedDB] Transient error "${err.name}". Retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 3; // exponential backoff
        continue;
      }
      throw err;
    }
  }
};

/**
 * Prunes the in-memory fallback cache to prevent memory leaks in case of prolonged IndexedDB outages.
 */
const pruneMemoryCache = () => {
  if (memoryCache.size > MAX_MEM_CACHE_SIZE) {
    // Evict oldest entries (Map keys maintain insertion order)
    const keysToPrune = Array.from(memoryCache.keys()).slice(0, 50);
    keysToPrune.forEach(k => memoryCache.delete(k));
  }
};

/**
 * Saves a serializable payload to IndexedDB securely, falling back to in-memory store if disabled.
 * @param {string} key 
 * @param {any} val 
 * @returns {Promise<void>}
 */
export const saveToOfflineCache = async (key, val) => {
  await checkStorageQuota();

  if (isIndexedDbFunctional) {
    try {
      await executeWithRetry(() => set(key, val));
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to save key "${key}". Falling back to memory:`, err);
    }
  }
  memoryCache.set(key, val);
  pruneMemoryCache();
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
      const val = await executeWithRetry(() => get(key));
      return val !== undefined ? val : fallback;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to read key "${key}". Falling back to memory:`, err);
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
      await executeWithRetry(() => del(key));
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to delete key "${key}". Falling back to memory:`, err);
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
      await executeWithRetry(() => clear());
      return;
    } catch (err) {
      console.warn(`[IndexedDB] Blocked or failed to clear cache. Falling back to memory:`, err);
    }
  }
  memoryCache.clear();
};
