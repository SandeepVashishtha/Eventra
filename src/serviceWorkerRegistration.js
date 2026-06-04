// serviceWorkerRegistration.js
// Registers the PWA service worker with dynamic lifecycle hooks to improve offline access.
import { logger } from './utils/logger';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};

const isDev = runtimeEnv.DEV ?? runtimeEnv.NODE_ENV === 'development';
const publicBaseUrl = runtimeEnv.BASE_URL || "/";
const isProd = runtimeEnv.PROD ?? runtimeEnv.NODE_ENV === "production";
const MAX_SW_RETRIES = 3;
const SW_RETRY_DELAY = 2000;

const retryServiceWorkerOperation = async (
  operation,
  retries = MAX_SW_RETRIES
) => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, SW_RETRY_DELAY)
    );

    return retryServiceWorkerOperation(operation, retries - 1);
  }
};

export function register(config) {
  if (isProd && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(publicBaseUrl, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${publicUrl.pathname.replace(/\/$/, "")}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add logging to localhost, welcoming developers
        navigator.serviceWorker.ready.then(() => {
          logger.log(
            'This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/pwa'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  retryServiceWorkerOperation(() =>
    navigator.serviceWorker.register(swUrl)
  )
    .then((registration) => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          logger.log('[Service Worker] Cache updated to version:', event.data.version);
          window.dispatchEvent(new CustomEvent('sw-cache-updated', { detail: event.data }));
        }
      });
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              logger.log(
                'New content is available and will be used when all tabs for this page are closed. See https://cra.link/pwa.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a "Content is cached for offline use!" message.
              logger.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      if (isDev) {
        logger.error(
          'Error during service worker registration:',
          error
        );
      }
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      logger.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        if (isDev) {
          logger.error(error.message);
        }
      });
  }
}
