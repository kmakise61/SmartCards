const CACHE_NAME = 'pnle-smartcards-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Using relative paths to ensure it works in subfolders
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(new Request(url, { cache: 'reload' })))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Handle Navigation Requests (SPA support)
  // This ensures that when you launch from Home Screen or refresh a deep link,
  // the service worker provides the shell (index.html).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // 2. Handle static assets and other GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback to index.html for any failed fetch that might be a route
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
