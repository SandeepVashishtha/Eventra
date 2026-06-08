
const CACHE_NAME = 'eventra-leaderboard-v1';
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/leaderboard')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
