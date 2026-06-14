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

export const pushToNotificationQueue = (action, payload) => {
  const queue = safeGetQueue();
  queue.push({ action, payload, timestamp: Date.now() });
  safeWriteQueue(queue);
};

export const syncNotificationQueue = async (apiUtils) => {
  const queue = safeGetQueue();
  if (queue.length === 0) return;

  // 🔥 FIX: only remove successfully-synced items from the queue. Previously
  // a single failed item caused the entire queue to be wiped at the end of
  // the function, silently losing every subsequent item that had not yet been
  // attempted.
  const remaining = [];
  for (const item of queue) {
    try {
      if (item.action === 'read') await apiUtils.put(item.payload.endpoint, {});
      else if (item.action === 'delete') await apiUtils.delete(item.payload.endpoint);
    } catch (e) {
      console.error('Failed to sync queued notification action', e);
      // Keep the failed item (and any that come after) in the queue.
      // We rebuild the remaining list with the failed item followed by all
      // unprocessed items.
      const failedIndex = queue.indexOf(item);
      remaining.push(item, ...queue.slice(failedIndex + 1));
      break;
    }
  }

  // Persist the remaining (un-synced) items.
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      if (remaining.length === 0) {
        window.localStorage.removeItem('eventra_notif_queue');
      } else {
        window.localStorage.setItem('eventra_notif_queue', JSON.stringify(remaining));
      }
    } catch {}
  }
};
