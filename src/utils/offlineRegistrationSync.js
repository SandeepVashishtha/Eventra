
export const registerOfflineSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-offline-registrations');
      console.log('Background sync registered for offline registrations.');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  }
};
