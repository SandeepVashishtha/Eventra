import { openDB } from 'idb';

const DB_NAME = 'EventraOfflineDB';
const STORE_NAME = 'checkinQueue';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const queueCheckin = async (checkinData) => {
  const db = await initDB();
  const entry = {
    ...checkinData,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  await db.add(STORE_NAME, entry);
  return entry;
};

export const getPendingCheckins = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const clearPendingCheckins = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};

export const syncOfflineCheckins = async (apiSyncFn) => {
  if (!navigator.onLine) return;

  const pending = await getPendingCheckins();
  if (pending.length === 0) return;

  try {
    for (const item of pending) {
      await apiSyncFn(item);
    }
    await clearPendingCheckins();
    console.log('Successfully synchronized offline check-ins');
  } catch (error) {
    console.error('Failed to sync offline check-ins:', error);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Reconnected to internet. Triggering offline check-in sync...');
  });
}
