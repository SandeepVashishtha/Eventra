/* eslint-disable no-console */

/**
 * Service Worker & PWA Lifecycle Management Module
 * Supports update detection, Web Push notifications, background sync, and cache control.
 */

const defaultConfig = {
  swUrl: '/service-worker.js',
  scope: '/',
  onSuccess: (registration) => {
    console.log('[SW Utility] Content is cached for offline use.', registration);
  },
  onUpdate: (registration) => {
    console.log('[SW Utility] New content is available; please refresh.', registration);
  },
  onOffline: () => {
    console.log('[SW Utility] No internet connection found. Running in offline mode.');
  },
  onOnline: () => {
    console.log('[SW Utility] Internet connection restored.');
  },
  onError: (error) => {
    console.error('[SW Utility] Service Worker registration error:', error);
  },
};

/**
 * Helper to convert a Base64 string to a Uint8Array for VAPID push keys.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Checks if current environment is localhost or dev server.
 * @returns {boolean}
 */
export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Registers the Service Worker with full lifecycle hooks and event listeners.
 * @param {Object} [customConfig]
 */
export const registerServiceWorker = (customConfig = {}) => {
  const config = { ...defaultConfig, ...customConfig };

  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      console.warn('[SW Utility] Service worker origin mismatch. Skipping registration.');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = config.swUrl;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('[SW Utility] Application served cache-first by local Service Worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });

    setupConnectivityListeners(config);
  }
};

/**
 * Registers a valid service worker and sets up lifecycle event monitoring.
 */
const registerValidSW = (swUrl, config) => {
  navigator.serviceWorker
    .register(swUrl, { scope: config.scope })
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW Utility] New content is available; will activate when tabs close.');
              if (config.onUpdate) config.onUpdate(registration);
            } else {
              console.log('[SW Utility] Content is cached for offline use.');
              if (config.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW Utility] Error during service worker registration:', error);
      if (config.onError) config.onError(error);
    });
};

/**
 * Validates service worker response in localhost environments.
 */
const checkValidServiceWorker = (swUrl, config) => {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW Utility] No internet connection found. App is running in offline mode.');
      if (config.onOffline) config.onOffline();
    });
};

/**
 * Configures global online/offline event listeners.
 */
const setupConnectivityListeners = (config) => {
  window.addEventListener('online', () => {
    if (config.onOnline) config.onOnline();
  });

  window.addEventListener('offline', () => {
    if (config.onOffline) config.onOffline();
  });
};

/**
 * Signals waiting Service Worker to skip waiting and force immediate activation.
 */
export const skipWaitingAndReload = async () => {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => {
      window.location.reload();
    },
    { once: true }
  );
};

/**
 * Checks for available Service Worker updates manually.
 * @returns {Promise<boolean>} True if an update is waiting to activate.
 */
export const checkForUpdates = async () => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return Boolean(registration.waiting);
  } catch (error) {
    console.error('[SW Utility] Error checking for updates:', error);
    return false;
  }
};

/**
 * Subscribes current user to Web Push notifications.
 * @param {string} vapidPublicKey - Public VAPID Key
 * @returns {Promise<PushSubscription|null>}
 */
export const subscribeUserToPush = async (vapidPublicKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push messaging is not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      return existingSubscription;
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    console.log('[Push] User successfully subscribed to push notifications.');
    return newSubscription;
  } catch (error) {
    console.error('[Push] Failed to subscribe user to push notifications:', error);
    throw error;
  }
};

/**
 * Unsubscribes current user from Web Push notifications.
 * @returns {Promise<boolean>}
 */
export const unsubscribeUserFromPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('[Push] User unsubscribed from push notifications.');
      return result;
    }
    return false;
  } catch (error) {
    console.error('[Push] Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Gets existing push subscription object.
 * @returns {Promise<PushSubscription|null>}
 */
export const getPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Push] Error fetching push subscription:', error);
    return null;
  }
};

/**
 * Registers a Background Sync tag for background task execution.
 * @param {string} tag - Unique sync tag name
 * @returns {Promise<boolean>}
 */
export const registerBackgroundSync = async (tag) => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('[Sync] Background sync is not supported by this browser.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log(`[Sync] Background sync registered with tag: "${tag}"`);
    return true;
  } catch (error) {
    console.error(`[Sync] Failed to register background sync for tag "${tag}":`, error);
    return false;
  }
};

/**
 * Clears all active application Cache Storage.
 * @returns {Promise<boolean>}
 */
export const clearAppCaches = async () => {
  if (!('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log('[Cache] Successfully cleared all cache storage.');
    return true;
  } catch (error) {
    console.error('[Cache] Failed to clear application caches:', error);
    return false;
  }
};

/**
 * Estimates current cache and web storage usage in MB.
 * @returns {Promise<{ usageMB: number, quotaMB: number }|null>}
 */
export const getCacheStorageUsage = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      return {
        usageMB: parseFloat((usage / (1024 * 1024)).toFixed(2)),
        quotaMB: parseFloat((quota / (1024 * 1024)).toFixed(2)),
      };
    } catch (error) {
      console.error('[Storage] Error estimating storage usage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Unregisters the Service Worker and releases control.
 */
export const unregisterServiceWorker = () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[Service Worker] Successfully unregistered.');
          }
        });
      })
      .catch((error) => {
        console.error('[Service Worker] Unregister failed:', error);
      });
  }
};