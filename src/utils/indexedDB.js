import { get, set, del, clear } from 'idb-keyval';

/**
 * Saves a serializable payload to IndexedDB securely.
 * @param {string} key 
 * @param {any} val 
 * @returns {Promise<void>}
 */
export const saveToOfflineCache = async (key, val) => {
  try {
    await set(key, val);
  } catch (err) {
    console.error(`[IndexedDB] Failed to save key "${key}":`, err);
  }
};

/**
 * Retrieves a payload from IndexedDB.
 * @param {string} key 
 * @param {any} fallback 
 * @returns {Promise<any>}
 */
export const getFromOfflineCache = async (key, fallback = null) => {
  try {
    const val = await get(key);
    return val !== undefined ? val : fallback;
  } catch (err) {
    console.error(`[IndexedDB] Failed to read key "${key}":`, err);
    return fallback;
  }
};

/**
 * Deletes a specific key from IndexedDB.
 * @param {string} key 
 * @returns {Promise<void>}
 */
export const removeFromOfflineCache = async (key) => {
  try {
    await del(key);
  } catch (err) {
    console.error(`[IndexedDB] Failed to delete key "${key}":`, err);
  }
};

/**
 * Clears the entire IndexedDB cache for this origin.
 * Use cautiously.
 * @returns {Promise<void>}
 */
export const clearOfflineCache = async () => {
  try {
    await clear();
  } catch (err) {
    console.error(`[IndexedDB] Failed to clear cache:`, err);
  }
};
