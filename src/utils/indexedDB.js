import { get, set, del, clear } from "idb-keyval";

// In-memory cache fallback when IndexedDB is blocked (e.g., in private windows)
const memoryCache = new Map();
let isIndexedDbFunctional = true;
let lastQuotaCheck = 0;

const MAX_MEM_CACHE_SIZE = 500;
const QUOTA_CHECK_INTERVAL_MS = 10000; // Check storage quota at most once every 10s

const TRANSIENT_ERROR_NAMES = new Set([
  "AbortError",
  "TransactionInactiveError",
  "UnknownError",
  "ConstraintError",
]);

/**
 * Checks if the thrown error is transient (e.g. database locks or transaction aborts).
 */
const isTransientError = (err) => {
  if (!err) return false;
  if (TRANSIENT_ERROR_NAMES.has(err.name)) return true;
  const msg = String(err.message || "").toLowerCase();
  return msg.includes("transient") || msg.includes("lock");
};

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
      if (isTransientError(err) && attempt < retries) {
        console.warn(
          `[IndexedDB] Transient error "${err.name}". Retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
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
    keysToPrune.forEach((k) => memoryCache.delete(k));
  }
};

/**
 * Generic runner that attempts an IndexedDB operation first and falls back to memory on failure.
 */
const runCacheOperation = async (idbOp, memoryOp, warningMsg) => {
  if (isIndexedDbFunctional) {
    try {
      return await executeWithRetry(idbOp);
    } catch (err) {
      console.warn(warningMsg, err);
    }
  }
  return memoryOp();
};

/**
 * Saves a serializable payload to IndexedDB securely, falling back to in-memory store if disabled.
 * @param {string} key
 * @param {any} val
 * @returns {Promise<void>}
 */
export const saveToOfflineCache = async (key, val) => {
  await checkStorageQuota();
  await runCacheOperation(
    () => set(key, val),
    () => {
      memoryCache.set(key, val);
      pruneMemoryCache();
    },
    `[IndexedDB] Blocked or failed to save key "${key}". Falling back to memory:`
  );
};

/**
 * Retrieves a payload from IndexedDB, falling back to in-memory store if disabled.
 * @param {string} key
 * @param {any} fallback
 * @returns {Promise<any>}
 */
export const getFromOfflineCache = async (key, fallback = null) => {
  return runCacheOperation(
    async () => {
      const val = await get(key);
      return val !== undefined ? val : fallback;
    },
    () => {
      const memVal = memoryCache.get(key);
      return memVal !== undefined ? memVal : fallback;
    },
    `[IndexedDB] Blocked or failed to read key "${key}". Falling back to memory:`
  );
};

/**
 * Deletes a specific key from IndexedDB, falling back to in-memory store if disabled.
 * @param {string} key
 * @returns {Promise<void>}
 */
export const removeFromOfflineCache = async (key) => {
  await runCacheOperation(
    () => del(key),
    () => memoryCache.delete(key),
    `[IndexedDB] Blocked or failed to delete key "${key}". Falling back to memory:`
  );
};

/**
 * Clears the entire IndexedDB cache for this origin, falling back to in-memory store if disabled.
 * Use cautiously.
 * @returns {Promise<void>}
 */
export const clearOfflineCache = async () => {
  await runCacheOperation(
    () => clear(),
    () => memoryCache.clear(),
    `[IndexedDB] Blocked or failed to clear cache. Falling back to memory:`
  );
};
