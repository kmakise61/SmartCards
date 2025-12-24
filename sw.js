const CACHE_NAME = 'pnle-smartcards-v14'; // Incremented version to force update

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  // CRITICAL: External Libraries must be cached for offline use
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  // These must match the import map in index.html exactly
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

// 1. Install: Force download of static assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching external dependencies...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: Intelligent Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Navigation (HTML): Network First -> Cache Fallback
  // Allows user to get updates if online, but works if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // B. External Libs (React, Tailwind): Cache First
  // These never change, so serve from cache instantly for speed
  if (
    url.origin.includes('esm.sh') || 
    url.origin.includes('tailwindcss.com') ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          // If not in cache, fetch it and save it for next time
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // C. Default: Stale-While-Revalidate
  // Serve from cache immediately, then update cache in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
          // If offline and fetching image, fallback to icon
          if (event.request.destination === 'image') {
              return caches.match('/icon.svg');
          }
      });
      return cachedResponse || fetchPromise;
    })
  );
});