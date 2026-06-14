const MAX_QUEUE_SIZE = 500;

const safeGetQueue = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem('eventra_notif_queue');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeWriteQueue = (queue) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    // Enforce a hard cap to prevent unbounded localStorage growth
    const trimmed = queue.length > MAX_QUEUE_SIZE ? queue.slice(0, MAX_QUEUE_SIZE) : queue;
    window.localStorage.setItem('eventra_notif_queue', JSON.stringify(trimmed));
  } catch {
    // localStorage may be full or blocked
  }
};

const persistRemaining = (remaining) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (remaining.length === 0) {
      window.localStorage.removeItem('eventra_notif_queue');
    } else {
      window.localStorage.setItem('eventra_notif_queue', JSON.stringify(remaining));
    }
  } catch {
    // localStorage may be full or blocked
  }
};

export const pushToNotificationQueue = (action, payload) => {
  const queue = safeGetQueue();
  queue.push({ action, payload, timestamp: Date.now() });
  safeWriteQueue(queue);
};

// 🔥 CodeScene refactor: extracted to keep syncNotificationQueue below the
// "Complex Method" and "Bumpy Road" thresholds.
const dispatchOne = async (item, apiUtils) => {
  if (item.action === 'read') return apiUtils.put(item.payload.endpoint, {});
  if (item.action === 'delete') return apiUtils.delete(item.payload.endpoint);
};

const trySyncItem = async (item, queue, apiUtils) => {
  try {
    await dispatchOne(item, apiUtils);
    return null; // success — not remaining
  } catch (e) {
    console.error('Failed to sync queued notification action', e);
    // Build the remaining list: failed item + everything after it
    const failedIndex = queue.indexOf(item);
    return [item, ...queue.slice(failedIndex + 1)];
  }
};

export const syncNotificationQueue = async (apiUtils) => {
  const queue = safeGetQueue();
  if (queue.length === 0) return;

  // 🔥 FIX: only remove successfully-synced items from the queue. Previously
  // a single failed item caused the entire queue to be wiped at the end of
  // the function, silently losing every subsequent item that had not yet been
  // attempted.
  let remaining = [];
  for (const item of queue) {
    const failedTail = await trySyncItem(item, queue, apiUtils);
    if (failedTail) {
      remaining = failedTail;
      break;
    }
  }

  persistRemaining(remaining);
};
