const CACHE_NAME = 'pnle-smartcards-v20'; // Version Bumped

// 1. CRITICAL: The App Shell (Must exist or app is useless)
// If any of these fail, the app WILL NOT work offline.
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

// 2. OPTIONAL: Nice to have, but don't crash if missing
const OPTIONAL_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('SW: Installing...');
      
      // Install Critical Assets
      try {
        await cache.addAll(CRITICAL_ASSETS);
      } catch (e) {
        console.error('SW: Critical asset failed', e);
      }

      // Install Optional Assets (One by one, ignoring errors)
      for (const url of OPTIONAL_ASSETS) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            await cache.put(url, res);
          } else {
            console.warn(`SW: Failed to fetch ${url} (Status: ${res.status})`);
          }
        } catch (e) {
          console.warn(`SW: Could not cache ${url}`, e);
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
  // Navigation: Network First -> Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // External Libs: Cache First
  const url = new URL(event.request.url);
  if (url.origin.includes('esm.sh') || url.origin.includes('tailwindcss.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        if (res.ok) {
          caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => null);
      return cached || fetchPromise;
    })
  );
});