
import { logger } from './logger';

export const registerOfflineSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-offline-registrations');
      logger.info('Background sync registered for offline registrations.');
    } catch (err) {
      logger.error('Background sync registration failed:', err);
    }
  }
};
