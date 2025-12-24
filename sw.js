
const CACHE_NAME = 'pnle-smartcards-v12';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

// 1. Install - Pre-cache the shell and critical CDN assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching App Shell & Assets');
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

// 3. Fetch - Cache First for Navigation, Stale-While-Revalidate for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. NAVIGATION REQUESTS (App Shell) - STRICT CACHE FIRST
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { ignoreSearch: true })
    );
    return;
  }

  // B. ASSETS (Static & CDN)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Network Fallback with Cache-on-fetch for allowed domains
      return fetch(event.request).then((networkResponse) => {
        // Cache external scripts (CDN) on the fly
        const isExternalAsset = 
          url.origin.includes('esm.sh') || 
          url.origin.includes('tailwindcss.com') || 
          url.origin.includes('fonts.googleapis.com') ||
          url.origin.includes('fonts.gstatic.com');

        if (networkResponse.ok && (isExternalAsset || event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'image')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for images if offline and not cached
        if (event.request.destination === 'image') {
          return caches.match('/icon.svg');
        }
      });
    })
  );
});
