const CACHE_NAME = 'pnle-smartcards-v18'; // Version Bumped

// CRITICAL: These MUST exist for the app to load.
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

// OPTIONAL: If these fail, we continue anyway.
const OPTIONAL_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('SW: Installing...');
      
      // 1. Install Critical Assets (Fail if these are missing)
      await cache.addAll(CRITICAL_ASSETS);
      
      // 2. Try to install Optional Assets (Ignore errors)
      // This prevents the "IP Server Not Found" error if you forgot the icon.
      for (const url of OPTIONAL_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('SW: Failed to cache optional asset:', url);
        }
      }
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation (HTML): Network First -> Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. External Libs: Cache First
  if (
    url.origin.includes('esm.sh') || 
    url.origin.includes('tailwindcss.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  // 3. Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        if (res.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => null);
      
      return cached || fetchPromise;
    })
  );
});
