import { logger } from './logger';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          logger.log('[Service Worker] Registered:', registration.scope);
        })
        .catch((error) => {
          logger.error('[Service Worker] Registration failed:', error);
        });
    });
  }
};

export const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        logger.error('[Service Worker] Unregister failed:', error);
      });
  }
};
