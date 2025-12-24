const CACHE_NAME = 'pnle-smartcards-v7';

self.addEventListener('install', (event) => {
  // Use absolute URLs for caching based on the service worker's scope
  const rootUrl = new URL('./', self.registration.scope).href;
  const indexUrl = new URL('./index.html', self.registration.scope).href;
  const iconUrl = new URL('./icon.svg', self.registration.scope).href;
  const manifestUrl = new URL('./manifest.json', self.registration.scope).href;

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([rootUrl, indexUrl, iconUrl, manifestUrl]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const shellUrl = new URL('./index.html', self.registration.scope).href;

  // SPA Navigation handling:
  // For any navigation request (launch from home screen, browser refresh on a route),
  // immediately serve the cached app shell (index.html).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(shellUrl).then((cachedResponse) => {
        // Return cached shell or fetch the specific shell file if missing
        return cachedResponse || fetch(shellUrl).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(shellUrl, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Regular static asset handling
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});