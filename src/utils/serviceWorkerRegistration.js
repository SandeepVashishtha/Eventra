/**
 * Enterprise Progressive Web App (PWA) & Service Worker Lifecycle Management Engine
 *
 * Provides service worker registration, lifecycle hook management (onUpdate, onSuccess),
 * automatic update detection, skipWaiting execution, offline/online status tracking,
 * and secure origin verification.
 */

// ============================================================================
// 1. Helpers & Environment Detection
// ============================================================================

const isLocalhost = Boolean(
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/))
);

/**
 * Checks if the current browser environment supports Service Workers and HTTPS/Localhost.
 *
 * @returns {boolean} True if SW registration is safe and supported.
 */
export const isServiceWorkerSupported = () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  // SW requires HTTPS unless running on localhost
  const isSecureContext = window.location.protocol === "https:" || isLocalhost;
  return isSecureContext;
};

// ============================================================================
// 2. Primary Service Worker Registration
// ============================================================================

/**
 * Registers the service worker with lifecycle hooks for updates, offline caching, and errors.
 *
 * @param {Object} [config={}] - Registration configuration and callbacks.
 * @param {string} [config.swUrl='/service-worker.js'] - Path to the service worker script.
 * @param {Function} [config.onSuccess] - Callback when content is cached for offline use.
 * @param {Function} [config.onUpdate] - Callback when new content is available and waiting to activate.
 * @param {Function} [config.onError] - Callback when service worker registration fails.
 * @param {boolean} [config.immediate=false] - Register immediately instead of waiting for window 'load'.
 * @returns {Promise<ServiceWorkerRegistration|null>} Registration promise.
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

export function registerServiceWorker(config = {}) {
  const {
    swUrl = getSwUrl(),
    onSuccess,
    onUpdate,
    onError,
    immediate = false,
  } = config;

  if (!isServiceWorkerSupported()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[PWA] Service Workers are not supported or running in an insecure context.");
    }
    return Promise.resolve(null);
  }

  const registerScript = () => {
    return navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Handle updates found during page load or SW updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New content is available; waiting to activate
                if (process.env.NODE_ENV !== "production") {
                  console.log("[PWA] New content is available and waiting to activate.");
                }
                if (typeof onUpdate === "function") {
                  onUpdate(registration);
                }
              } else {
                // Content has been cached for offline use
                if (process.env.NODE_ENV !== "production") {
                  console.log("[PWA] Content is cached for offline use.");
                }
                if (typeof onSuccess === "function") {
                  onSuccess(registration);
                }
              }
            }
          };
        };

        if (isLocalhost) {
          checkValidServiceWorker(swUrl, config);
        }

        return registration;
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[PWA] Error during service worker registration:", error);
        }
        if (typeof onError === "function") {
          onError(error);
        }
        return null;
      });
  };

  if (immediate || document.readyState === "complete") {
    return registerScript();
  }

  return new Promise((resolve) => {
    window.addEventListener("load", () => {
      resolve(registerScript());
    });
  });
}

/**
 * Validates service worker asset existence when running on localhost.
 */
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // SW not found or bad JS asset; unregister and reload
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      }
    })
    .catch(() => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[PWA] No internet connection found. App running in offline mode.");
      }
    });
}

// ============================================================================
// 3. Lifecycle Controls: Update, Reload & Unregister
// ============================================================================

/**
 * Prompts the waiting service worker to skip waiting and activate immediately.
 * Optionally reloads the page once activated.
 *
 * @param {ServiceWorkerRegistration} registration - Active SW registration object.
 * @param {boolean} [autoReload=true] - Automatically reload window when controller changes.
 */
export function skipWaitingAndActivate(registration, autoReload = true) {
  if (!registration || !registration.waiting) return;

  if (autoReload) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  registration.waiting.postMessage({ type: "SKIP_WAITING" });
}

/**
 * Forces a check for an updated service worker script on the server.
 *
 * @param {ServiceWorkerRegistration} [registration] - Optional registration instance.
 * @returns {Promise<void>}
 */
export async function checkForSWUpdates(registration) {
  if (!isServiceWorkerSupported()) return;

  try {
    const reg = registration || (await navigator.serviceWorker.ready);
    await reg.update();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[PWA] Failed to check for service worker updates:", error);
    }
  }
}

/**
 * Unregisters all active service workers for the domain and purges SW caches.
 *
 * @param {boolean} [clearCaches=false] - If true, clears CacheStorage caches as well.
 * @returns {Promise<boolean>} True if unregistered successfully.
 */
export function unregisterServiceWorker(clearCaches = false) {
  if (!isServiceWorkerSupported()) return Promise.resolve(false);

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.unregister().then(async (success) => {
        if (clearCaches && "caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        return success;
      });
    })
    .catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[PWA] Unregister failed:", error);
      }
      return false;
    });
}

// ============================================================================
// 4. Network Status & Connectivity Helpers
// ============================================================================

/**
 * Subscribes to network online/offline state changes.
 *
 * @param {Function} onOnline - Callback when connection is restored.
 * @param {Function} onOffline - Callback when connection is lost.
 * @returns {Function} Unsubscribe cleanup function.
 */
export function subscribeNetworkStatus(onOnline, onOffline) {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => onOnline && onOnline();
  const handleOffline = () => onOffline && onOffline();

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * Returns current browser online state.
 *
 * @returns {boolean} True if navigator is online.
 */
export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export default registerServiceWorker;
