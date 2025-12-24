
const CACHE_NAME = 'pnle-smartcards-v11';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './index.tsx'
];

// 1. Install - Pre-cache the shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Cleanup old caches
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

// 3. Fetch - The "App Shell" Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // A. NAVIGATION REQUESTS (Single Page App stability)
  // Always serve index.html for navigation, ignoring query params like ?source=pwa
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html', { ignoreSearch: true }) || caches.match('./', { ignoreSearch: true });
      })
    );
    return;
  }

  // B. STATIC & DYNAMIC ASSETS
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache external scripts (CDN) on the fly for complete offline functionality
        // Includes: esm.sh (React/Lucide), tailwindcss.com, and Google Fonts
        const isExternalAsset = 
          url.origin.includes('esm.sh') || 
          url.origin.includes('tailwindcss.com') || 
          url.origin.includes('fonts.googleapis.com') ||
          url.origin.includes('fonts.gstatic.com');

        if (networkResponse.ok && (isExternalAsset || event.request.destination === 'script' || event.request.destination === 'style')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for images
        if (event.request.destination === 'image') {
          return caches.match('./icon.svg');
        }
      });
    })
  );
});
