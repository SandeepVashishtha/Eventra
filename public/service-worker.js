/*
 * Eventra Service Worker for PWA Offline Support
 *
 * Implements standard Cache-First strategy for static assets and
 * Network-First strategy for dynamic pages and API paths to ensure
 * smooth offline browsing.
 */
const CACHE_NAME = 'eventra-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/Eventra.png',
  '/moon.svg',
  '/sun.svg',
  '/static/js/bundle.js'
];

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

// Install Service Worker and cache core static assets
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
          return cache.addAll(assets);
        });
      })
      .catch((err) => {
        log('[Service Worker] Precaching failed or manifest not found, falling back to static assets:', err);
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(ASSETS_TO_CACHE);
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

// Intercept fetch requests and apply offline caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests and external resources (except essential fonts/icons)
  if (event.request.method !== 'GET') return;

  // Network-First strategy for API routes to always deliver fresh data when online
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache fresh API response if it is successful
          if (response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, check if we have cached API response
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return clean JSON fallback for offline status
            return new Response(
              JSON.stringify({
                error: 'You are currently offline. Event details will synchronize automatically once reconnected.',
                offline: true
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Cache-First strategy for static assets and page views
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache instantly, and fetch fresh resource in the background (stale-while-revalidate)
        fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
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
          // Offline fallback for navigation requests (HTML views)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
