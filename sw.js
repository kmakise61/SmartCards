const CACHE_NAME = 'pnle-smartcards-v16'; // Version bumped

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  // External Dependencies (Must be cached!)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.469.0?external=react'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // IMPORTANT: If any single file here 404s, the whole install fails.
      // Ensure all these files exist.
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
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

  // --- STRATEGY 1: Navigation (The App Shell) ---
  // If the browser asks for a page (like /?source=pwa), give them index.html from cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        // Return cache immediately if found (OFFLINE FIX)
        if (cached) return cached;
        
        // If not in cache, go to network
        return fetch('/index.html').then((response) => {
           return caches.open(CACHE_NAME).then((cache) => {
             cache.put('/index.html', response.clone());
             return response;
           });
        });
      }).catch(() => {
        // Final safety net
        return caches.match('/index.html');
      })
    );
    return;
  }

  // --- STRATEGY 2: External Libraries (Immutable) ---
  // Serve from cache immediately.
  if (
    url.origin.includes('esm.sh') || 
    url.origin.includes('tailwindcss.com') ||
    url.origin.includes('fonts.googleapis') ||
    url.origin.includes('fonts.gstatic')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
           const clone = response.clone();
           caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
           return response;
        });
      })
    );
    return;
  }

  // --- STRATEGY 3: Everything Else (Stale-While-Revalidate) ---
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Update cache with new version
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
           // Network failed. If we have cached, great. If not, return nothing.
        });
      
      // Return cached version first, or wait for network if nothing cached
      return cached || fetchPromise;
    })
  );
});
