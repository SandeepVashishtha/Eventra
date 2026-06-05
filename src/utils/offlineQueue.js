import { get, set, del } from 'idb-keyval';

const QUEUE_KEY = 'eventra_offline_queue';

export const getQueueIndexedDB = async () => {
  try {
    const queue = await get(QUEUE_KEY);
    return queue || [];
  } catch (err) {
    console.error("IndexedDB getQueue failed:", err);
    return [];
  }
};

export const pushToQueue = async (item) => {
  const actionItem = {
    id: item.id || Date.now() + Math.random().toString(36).substring(2, 7),
    timestamp: item.timestamp || new Date().toISOString(),
    retryCount: item.retryCount || 0,
    actionType: item.actionType || "REGISTER_EVENT",
    eventId: item.eventId || null,
    payload: item.payload || {},
    endpoint: item.endpoint || null
  };

  try {
    const queue = await getQueueIndexedDB();
    if (queue.length >= 15) {
      console.warn('Offline queue limit reached. Dropping item to prevent local overflow.');
      return;
    }
    queue.push(actionItem);
    await set(QUEUE_KEY, queue);
  } catch (err) {
    console.error("IndexedDB push failed:", err);
  }
};

export const setQueue = async (newQueue) => {
  try {
    if (newQueue.length === 0) {
      await del(QUEUE_KEY);
    } else {
      await set(QUEUE_KEY, newQueue);
    }
  } catch (err) {
    console.error("IndexedDB setQueue failed:", err);
  }
};

export const clearQueue = async () => {
  try {
    await del(QUEUE_KEY);
  } catch (err) {
    console.error("IndexedDB clear failed:", err);
  }
};
