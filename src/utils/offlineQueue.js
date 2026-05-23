// ---------------------------------------------------------------------------
// Shared Offline Queue Utility
// ---------------------------------------------------------------------------
// Single source of truth for the offline registration queue stored in
// localStorage. Both EventRegistration (producer) and useOfflineSync
// (consumer) import from here instead of defining their own logic.

const QUEUE_KEY = 'eventra_offline_queue';
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Read the current offline queue from localStorage.
 * Returns an empty array if the key is missing or the JSON is malformed.
 * Filters out expired queue entries (older than 24 hours).
 *
 * @returns {Array} The current queue entries.
 */
export const getQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const active = parsed.filter((item) => {
      const timestamp = item.timestamp || now;
      return now - timestamp < QUEUE_TTL_MS;
    });

    if (active.length !== parsed.length) {
      if (active.length === 0) {
        localStorage.removeItem(QUEUE_KEY);
      } else {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(active));
      }
    }

    return active;
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
  
  const itemWithTimestamp = {
    ...item,
    timestamp: Date.now(),
  };

  queue.push(itemWithTimestamp);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Overwrite the queue with a new array (used after partial sync to keep
 * only the items that failed).
 *
 * @param {Array} queue - The replacement queue.
 */
export const setQueue = (queue) => {
  if (queue.length === 0) {
    localStorage.removeItem(QUEUE_KEY);
  } else {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
};

/**
 * Remove the offline queue entirely from localStorage.
 */
export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};
