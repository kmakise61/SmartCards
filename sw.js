const CACHE_NAME = 'pnle-smartcards-v17'; // Version bumped

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg', // MAKE SURE THIS FILE EXISTS!
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching files...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Take control of the page immediately
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation (HTML): NETWORK FIRST, THEN CACHE
  // This fixes the "Unreachable" error. It tries the internet. 
  // If internet fails, it gives you the cached index.html.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return the cached index.html
          // regardless of what URL the user asked for (e.g. /?source=pwa)
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. External Assets (React, Tailwind): CACHE FIRST
  if (
    url.origin.includes('esm.sh') || 
    url.origin.includes('tailwindcss.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // 3. Everything else: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        if (res.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => null); // Eat errors if offline
      
      return cached || fetchPromise;
    })
  );
});
