// ---------------------------------------------------------------------------
// Shared Offline Queue Utility
// ---------------------------------------------------------------------------
// Single source of truth for the offline registration queue stored in
// localStorage. Both EventRegistration (producer) and useOfflineSync
// (consumer) import from here instead of defining their own logic.

const QUEUE_KEY = 'eventra_offline_queue';

/**
 * Read the current offline queue from localStorage.
 * Returns an empty array if the key is missing or the JSON is malformed.
 *
 * @returns {Array} The current queue entries.
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
 * Append a single item to the offline queue.
 *
 * @param {object} item - The queue entry to store (e.g. { eventId, payload }).
 */
export const pushToQueue = (item) => {
  const queue = getQueue();
  if (queue.length >= 5) {
    console.warn('Offline queue limit reached (max 5). Dropping new registration to prevent local DoS.');
    return;
  }
  queue.push(item);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline queue:', error);
  }
};

/**
 * Overwrite the queue with a new array (used after partial sync to keep
 * only the items that failed).
 *
 * @param {Array} queue - The replacement queue.
 */
export const setQueue = (queue) => {
  try {
    if (queue.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Error setting offline queue:', error);
  }
};

/**
 * Remove the offline queue entirely from localStorage.
 */
export const clearQueue = () => {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
};
