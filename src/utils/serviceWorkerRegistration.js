/* eslint-disable no-console */

/**
 * Default configuration options for the Service Worker manager.
 */
const DEFAULT_CONFIG = {
  swPath: '/service-worker.js',
  scope: '/',
  updateIntervalMs: 60 * 60 * 1000, // Check for updates every 1 hour
  autoUpdate: false,
  enableSync: true,
  enablePush: true,
  debug: false,
};

/**
 * Global state store for Service Worker registration and event listeners.
 */
const state = {
  registration: null,
  swUpdateAvailable: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  listeners: new Map(),
  updateTimer: null,
};

// ============================================================================
// Internal Helper Utilities
// ============================================================================

/**
 * Conditional debug logger.
 * @param {...any} args - Arguments to log.
 */
const log = (...args) => {
  if (DEFAULT_CONFIG.debug) {
    console.log('[SW Manager]', ...args);
  }
};

/**
 * Emits custom events to registered internal listeners and window DOM events.
 * @param {string} eventName - Name of the event.
 * @param {any} detail - Payload data.
 */
const emit = (eventName, detail) => {
  log(`Event Emitted: ${eventName}`, detail);

  // Trigger internal callbacks
  if (state.listeners.has(eventName)) {
    state.listeners.get(eventName).forEach((callback) => {
      try {
        callback(detail);
      } catch (err) {
        console.error(`[SW Manager] Error in listener for ${eventName}:`, err);
      }
    });
  }

  // Dispatch global DOM event if in browser context
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`sw:${eventName}`, { detail }));
  }
};

/**
 * Converts a Base64 VAPID key string into a Uint8Array for PushManager subscriptions.
 * @param {string} base64String - Base64 encoded key.
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

// ============================================================================
// Core Registration Functions (Original & Expanded)
// ============================================================================

/**
 * Original Service Worker registration wrapper.
 * Registers the service worker when the page finishes loading.
 */
export const registerServiceWorker = () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(DEFAULT_CONFIG.swPath, { scope: DEFAULT_CONFIG.scope })
        .then((registration) => {
          console.log('[Service Worker] Registered:', registration.scope);
          state.registration = registration;
          initRegistrationLifecycle(registration);
        })
        .catch((error) => {
          console.log('[Service Worker] Registration failed:', error);
          emit('error', error);
        });
    });
  }

  // SW requires HTTPS unless running on localhost
  const isSecureContext = window.location.protocol === "https:" || isLocalhost;
  return isSecureContext;
};

/**
 * Original Service Worker unregistration wrapper.
 * Unregisters the currently active service worker once ready.
 */
export const getEnv = () =>
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

export const getBaseUrl = () => {
  const env = getEnv();
  return env.BASE_URL || env.PUBLIC_URL || "/";
};

export const getSwUrl = () => {
  const base = getBaseUrl();
  if (typeof window !== "undefined" && window.location && window.location.href) {
    const baseHref = new URL(base, window.location.href).href;
    const baseWithSlash = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;
    return new URL("service-worker.js", baseWithSlash).pathname;
  }
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}service-worker.js`;
};

export const getSwScope = () => {
  const base = getBaseUrl();
  if (typeof window !== "undefined" && window.location && window.location.href) {
    const baseHref = new URL(base, window.location.href).href;
    const baseWithSlash = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;
    return new URL("./", baseWithSlash).pathname;
  }
  return base.endsWith("/") ? base : `${base}/`;
};

export const unregisterServiceWorker = () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[Service Worker] Successfully unregistered.');
            state.registration = null;
            emit('unregistered', null);
          }
        });
      })
      .catch((error) => {
        console.log('[Service Worker] Unregister failed:', error);
        emit('error', error);
      });
  }
};

/**
 * Advanced registration method returning a promise and supporting custom config options.
 * @param {Object} options - Custom configuration overrides.
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export const registerSW = async (options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    log('Service Workers are not supported in this environment.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(config.swPath, {
      scope: config.scope,
    });

    state.registration = registration;
    log('Service Worker registration successful with scope:', registration.scope);
    emit('registered', registration);

    initRegistrationLifecycle(registration, config);
    setupPeriodicUpdateChecks(registration, config.updateIntervalMs);
    setupNetworkStatusListeners();

    return registration;
  } catch (error) {
    console.error('[SW Manager] Registration error:', error);
    emit('error', error);
    throw error;
  }
};

// ============================================================================
// Lifecycle & Update Management
// ============================================================================

/**
 * Attaches lifecycle listeners to track installing, waiting, and active workers.
 * @param {ServiceWorkerRegistration} registration 
 * @param {Object} config 
 */
const initRegistrationLifecycle = (registration, config = DEFAULT_CONFIG) => {
  // If a worker is already waiting, an update is ready
  if (registration.waiting) {
    handleWorkerWaiting(registration.waiting, config);
  }

  // Listen for new workers being installed
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    log('New Service Worker installing...');
    emit('installing', installingWorker);

    installingWorker.addEventListener('statechange', () => {
      log(`Service Worker state changed: ${installingWorker.state}`);
      
      if (installingWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New content available, active worker exists
          handleWorkerWaiting(installingWorker, config);
        } else {
          // Content cached for offline use for the first time
          log('Content is cached for offline use.');
          emit('cached', installingWorker);
        }
      } else if (installingWorker.state === 'activated') {
        log('Service Worker activated.');
        emit('activated', installingWorker);
      }
    });
  });

  // Handle controller changes (e.g. after skipWaiting)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    log('Controller changed. Reloading page...');
    emit('controllerchange', null);
    window.location.reload();
  });
};

/**
 * Handles the state when an updated Service Worker is waiting to activate.
 * @param {ServiceWorker} worker 
 * @param {Object} config 
 */
const handleWorkerWaiting = (worker, config) => {
  state.swUpdateAvailable = true;
  log('New Service Worker update available and waiting.');
  emit('updateAvailable', { worker, registration: state.registration });

  if (config.autoUpdate) {
    skipWaiting(worker);
  }
};

/**
 * Forces the waiting Service Worker to become active.
 * @param {ServiceWorker} [targetWorker] 
 */
export const skipWaiting = (targetWorker) => {
  const worker = targetWorker || state.registration?.waiting;
  if (worker) {
    log('Sending SKIP_WAITING message to waiting worker...');
    worker.postMessage({ type: 'SKIP_WAITING' });
  } else {
    log('No waiting Service Worker found to skip waiting.');
  }
};

/**
 * Manually triggers a check for an updated Service Worker script.
 * @returns {Promise<boolean>} True if an update was found.
 */
export const checkForUpdates = async () => {
  if (!state.registration) {
    log('Cannot check for updates: No registration active.');
    return false;
  }

  try {
    log('Checking for Service Worker updates...');
    await state.registration.update();
    return Boolean(state.registration.waiting || state.registration.installing);
  } catch (error) {
    console.error('[SW Manager] Update check failed:', error);
    return false;
  }
};

/**
 * Sets up periodic polling to check for Service Worker updates.
 * @param {ServiceWorkerRegistration} registration 
 * @param {number} intervalMs 
 */
const setupPeriodicUpdateChecks = (registration, intervalMs) => {
  if (state.updateTimer) clearInterval(state.updateTimer);

  if (intervalMs > 0) {
    state.updateTimer = setInterval(() => {
      log('Running scheduled update check...');
      registration.update().catch((err) => {
        log('Scheduled update check failed:', err);
      });
    }, intervalMs);
  }
};

// ============================================================================
// Messaging & Communication Bridge
// ============================================================================

/**
 * Sends a message to the active Service Worker and waits for a response.
 * @param {Object} message - Object payload to send.
 * @param {number} [timeoutMs=5000] - Timeout limit in milliseconds.
 * @returns {Promise<any>} Response payload from the Service Worker.
 */
export const sendMessageToSW = (message, timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      return reject(new Error('No active Service Worker controller available.'));
    }

    const messageChannel = new MessageChannel();
    const timer = setTimeout(() => {
      reject(new Error(`SW Message timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timer);
      if (event.data && event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};

/**
 * Listens for incoming messages sent from the Service Worker to the client.
 * @param {Function} handler - Callback function (eventData) => void.
 * @returns {Function} Unsubscribe function.
 */
export const onSWMessage = (handler) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const listener = (event) => {
    log('Received message from Service Worker:', event.data);
    handler(event.data);
  };

  navigator.serviceWorker.addEventListener('message', listener);
  return () => {
    navigator.serviceWorker.removeEventListener('message', listener);
  };
};

// ============================================================================
// Push Notification Integration (#14321 Helper Connectors)
// ============================================================================

/**
 * Verifies if the browser supports ServiceWorkers and Web Push Manager APIs.
 * @returns {boolean}
 */
export const isPushSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  );
};

/**
 * Fetches current Web Push subscription state from the registered Service Worker.
 * @returns {Promise<PushSubscription|null>}
 */
export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;
  const reg = state.registration || (await navigator.serviceWorker.ready);
  return await reg.pushManager.getSubscription();
};

/**
 * Subscribes the client to Web Push notifications.
 * @param {string} vapidPublicKey - Public VAPID Key.
 * @returns {Promise<PushSubscription>}
 */
export const subscribeUserToPush = async (vapidPublicKey) => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported by this browser.');
  }

  const reg = state.registration || (await navigator.serviceWorker.ready);
  let subscription = await reg.pushManager.getSubscription();

  if (subscription) {
    log('Existing push subscription found:', subscription);
    return subscription;
  }

  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
  subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });

  log('Successfully subscribed to push notifications:', subscription);
  emit('pushSubscribed', subscription);
  return subscription;
};

/**
 * Unsubscribes the current device from Web Push notifications.
 * @returns {Promise<boolean>}
 */
export const unsubscribeUserFromPush = async () => {
  const subscription = await getPushSubscription();
  if (!subscription) {
    log('No active push subscription to unsubscribe from.');
    return false;
  }

  const result = await subscription.unsubscribe();
  if (result) {
    log('Successfully unsubscribed from push notifications.');
    emit('pushUnsubscribed', null);
  }
  return result;
};

// ============================================================================
// Background Sync & Offline Action Queueing
// ============================================================================

/**
 * Registers a Background Sync tag with the Service Worker.
 * @param {string} tag - Unique name for the sync task (e.g. 'sync-rsvp-queue').
 * @returns {Promise<boolean>}
 */
export const registerBackgroundSync = async (tag) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const reg = state.registration || (await navigator.serviceWorker.ready);
    if ('sync' in reg) {
      await reg.sync.register(tag);
      log(`Background sync registered for tag: "${tag}"`);
      emit('syncRegistered', tag);
      return true;
    }
    log('Background Sync API not supported in this browser.');
    return false;
  } catch (error) {
    console.error(`[SW Manager] Failed to register background sync for tag "${tag}":`, error);
    return false;
  }
};

/**
 * Listens for online/offline events to manage network state transitions.
 */
const setupNetworkStatusListeners = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    state.isOnline = true;
    log('Browser is online.');
    emit('onlineStatus', { isOnline: true });
  });

  window.addEventListener('offline', () => {
    state.isOnline = false;
    log('Browser is offline.');
    emit('onlineStatus', { isOnline: false });
  });
};

/**
 * Returns current online connection status.
 * @returns {boolean}
 */
export const getIsOnline = () => {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return state.isOnline;
};

// ============================================================================
// Cache Management & Warmup Helpers
// ============================================================================

/**
 * Requests the Service Worker to pre-cache a list of static URLs.
 * @param {string[]} urls - Array of asset URLs to cache.
 * @returns {Promise<any>}
 */
export const precacheAssets = async (urls = []) => {
  if (!Array.isArray(urls) || urls.length === 0) return;
  log('Requesting pre-cache for assets:', urls);
  return sendMessageToSW({ type: 'PRECACHE_ASSETS', payload: { urls } });
};

/**
 * Requests the Service Worker to clear specific or all runtime caches.
 * @param {string} [cacheName] - Name of specific cache to clear.
 * @returns {Promise<any>}
 */
export const clearSWCache = async (cacheName) => {
  log('Requesting cache purge:', cacheName || 'ALL_CACHES');
  return sendMessageToSW({ type: 'CLEAR_CACHE', payload: { cacheName } });
};

// ============================================================================
// Event Subscription Manager (Pub/Sub)
// ============================================================================

/**
 * Subscribes to custom Service Worker lifecycle events.
 * @param {string} eventName - Event key (e.g. 'registered', 'updateAvailable', 'onlineStatus').
 * @param {Function} callback - Function to execute when event fires.
 * @returns {Function} Unsubscribe function.
 */
export const onSWEvent = (eventName, callback) => {
  if (!state.listeners.has(eventName)) {
    state.listeners.set(eventName, new Set());
  }

  state.listeners.get(eventName).add(callback);

  return () => {
    const set = state.listeners.get(eventName);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        state.listeners.delete(eventName);
      }
    }
  };
};

/**
 * Returns the current internal SW manager state object.
 * @returns {Object}
 */
export const getSWState = () => ({
  registration: state.registration,
  swUpdateAvailable: state.swUpdateAvailable,
  isOnline: getIsOnline(),
  hasActiveWorker: Boolean(navigator?.serviceWorker?.controller),
});
