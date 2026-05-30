/*
 * Eventra Service Worker for PWA Offline Support
 *
 * Implements standard Cache-First strategy for static assets and
 * Network-First strategy for dynamic pages and API paths to ensure
 * smooth offline browsing.
 *
 * SECURITY: Service worker is configured to AVOID CACHING sensitive
 * authenticated API responses. Only public, non-authenticated endpoints
 * are cached to prevent privacy leaks and stale data exposure.
 */
const CACHE_NAME = 'eventra-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/Eventra.png',
  '/moon.svg',
  '/sun.svg'
];

/**
 * SECURITY: List of API endpoints that contain sensitive, authenticated,
 * or session-specific data and should NEVER be cached.
 *
 * These endpoints return user-specific information that should not persist
 * in browser cache storage to prevent:
 * - Privacy leaks on shared devices
 * - Stale authenticated data after logout
 * - Cross-user cache contamination
 *
 * Pattern matching:
 * - Exact path: /api/user/profile
 * - Path prefix: /api/user/* (includes /api/user/profile, /api/user/settings, etc.)
 */
const SENSITIVE_API_PATTERNS = [
  // User authentication & session
  '/api/auth/',
  '/api/user/',
  '/api/profile',
  '/api/session',

  // User data
  '/api/dashboard',
  '/api/notifications',
  '/api/preferences',
  '/api/settings',

  // Event registration & attendance (user-specific)
  '/api/registrations',
  '/api/attendances',
  '/api/my-events',
  '/api/event-registrations',

  // Volunteer/organizer only
  '/api/admin/',
  '/api/volunteers/me',
  '/api/organizers/me',
];

/**
 * SECURITY: List of API endpoints that are safe to cache.
 *
 * These are public, non-authenticated endpoints that don't contain
 * user-specific information. Safe to cache for offline support.
 *
 * Examples:
 * - Public event listings
 * - Event categories
 * - Static configuration
 */
const PUBLIC_API_PATTERNS = [
  '/api/events',
  '/api/categories',
  '/api/locations',
  '/api/config',
  '/api/public',
];

/**
 * Check if an API endpoint should be cached based on security rules.
 *
 * SECURITY: Authenticated and user-specific endpoints are never cached.
 * Cache-Control headers from the server are always respected.
 *
 * @param {string} pathname - Request URL pathname
 * @param {Response} response - The response object (to check headers)
 * @returns {boolean} True if safe to cache, false if should skip cache
 */
function isSafeToCache(pathname, response) {
  // Always respect Cache-Control header from server (most important)
  const cacheControl = response?.headers?.get('Cache-Control') || '';

  // If server explicitly says "no-cache" or "no-store", skip caching
  if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
    return false;
  }

  // If server says "private", it's user-specific data — don't cache
  if (cacheControl.includes('private')) {
    return false;
  }

  // SECURITY: Never cache sensitive/authenticated endpoints
  for (const pattern of SENSITIVE_API_PATTERNS) {
    if (pathname.startsWith(pattern)) {
      return false;
    }
  }

  // Only cache endpoints explicitly marked as public
  for (const pattern of PUBLIC_API_PATTERNS) {
    if (pathname.startsWith(pattern)) {
      return true;
    }
  }

  // Default: don't cache unknown API endpoints (fail-safe to privacy)
  return false;
}

// Minimal logger helper that only logs in local/dev environments
const isLocalhost = Boolean(
  self.location.hostname === 'localhost' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const log = (...args) => {
  if (isLocalhost) {
    console.log(...args);
  }
};

const addAllSafely = async (cache, assets) => {
  const uniqueAssets = [...new Set(assets)];
  await Promise.allSettled(
    uniqueAssets.map((asset) =>
      cache.add(asset).catch((error) => {
        log('[Service Worker] Skipping unavailable precache asset:', asset, error);
      })
    )
  );
};

// Install Service Worker and cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/asset-manifest.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch asset-manifest.json');
        }
        return response.json();
      })
      .then((manifest) => {
        const assets = [
          '/',
          '/index.html',
          '/manifest.json',
          '/favicon.png',
          '/Eventra.png',
          '/moon.svg',
          '/sun.svg',
        ];
        if (manifest && manifest.files) {
          Object.values(manifest.files).forEach((path) => {
            if (
              (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.jpg') || path.endsWith('.json')) &&
              !path.endsWith('.map') &&
              !path.includes('service-worker.js') &&
              !path.includes('manifest.json')
            ) {
              const cleanPath = path.startsWith('/') ? path : `/${path}`;
              if (!assets.includes(cleanPath)) {
                assets.push(cleanPath);
              }
            }
          });
        }
        return caches.open(CACHE_NAME).then((cache) => {
          log('[Service Worker] Precaching hashed assets from manifest:', assets);
          return addAllSafely(cache, assets);
        });
      })
      .catch((err) => {
        log('[Service Worker] Precaching failed or manifest not found, falling back to static assets:', err);
        return caches.open(CACHE_NAME).then((cache) => {
          return addAllSafely(cache, ASSETS_TO_CACHE);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker and clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            log('[Service Worker] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_UPDATED', version: CACHE_NAME });
        });
      });
    }).then(() => self.clients.claim())
  );
});

const notifyClientsToSyncOfflineQueue = async () => {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  });

  clients.forEach((client) => {
    client.postMessage({
      type: 'EVENTRA_BACKGROUND_SYNC',
      tag: BACKGROUND_SYNC_TAG,
    });
  });
};

const openNotificationTarget = async (targetUrl) => {
  const allClients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  });

  const appOrigin = self.location.origin;
  const fallbackUrl = `${appOrigin}/settings/notifications`;
  const destination = targetUrl ? new URL(targetUrl, appOrigin).href : fallbackUrl;

  for (const client of allClients) {
    if ('focus' in client) {
      if ('navigate' in client) {
        await client.navigate(destination);
      }
      return client.focus();
    }
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(destination);
  }
};

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const title = payload.title || 'Eventra notification';
  const options = {
    body: payload.body || payload.message || 'You have a new update.',
    icon: payload.icon || '/favicon.png',
    badge: payload.badge || '/favicon.png',
    tag: payload.tag || payload.category || 'eventra-notification',
    data: {
      url: payload.url || '/settings/notifications',
      notificationId: payload.id || null,
      category: payload.category || 'general',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(openNotificationTarget(event.notification.data?.url));
});

// Background Sync wakes the app after connectivity returns. The authenticated
// replay still happens in the page context so tokens and conflict UI stay there.
self.addEventListener('sync', (event) => {
  if (event.tag !== BACKGROUND_SYNC_TAG) {
    return;
  }

  event.waitUntil(notifyClientsToSyncOfflineQueue());
});

// Intercept fetch requests and apply offline caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP(S) requests e.g. chrome-extension://
  if (!event.request.url.startsWith('http')) return;

  // SECURITY: Network-First strategy for API routes with sensitive data filtering
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // SECURITY: Only cache responses that are safe according to security rules
          if (response.status === 200 && isSafeToCache(requestUrl.pathname, response)) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              log(`[Service Worker] Caching public API response: ${requestUrl.pathname}`);
              cache.put(event.request, responseCopy);
            });
          } else if (response.status === 200) {
            log(`[Service Worker] Skipping cache for sensitive API: ${requestUrl.pathname}`);
          }
          return response;
        })
        .catch(() => {
          // Only serve cached response if it was safe to cache (public endpoint)
          return caches.match(event.request).then((cachedResponse) => {
            // Only return cached response if it's from a public endpoint
            if (cachedResponse && isSafeToCache(requestUrl.pathname, cachedResponse)) {
              log(`[Service Worker] Serving cached public API response: ${requestUrl.pathname}`);
              return cachedResponse;
            }

            // For sensitive endpoints or cache miss, return an empty response instead of failing hard
            return new Response('', { status: 200 });
          });
        })
    );
    return;
  }

  // Cache-First strategy for static assets and page views
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: serve cache, update in background
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response).catch(() => {});
              });
            }
          })
          .catch(() => {/* Ignore bg fetch failures when offline */});

        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
          return response;
        })
        .catch(() => {
          return new Response('', { status: 200 });
        });
    })
  );
});
