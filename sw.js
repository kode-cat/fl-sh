const CACHE_NAME = 'fl-sh-cache-v1';
const ASSETS_TO_CACHE = [
  '/fl-sh/',
  '/fl-sh/index.html',
  '/fl-sh/manifest.json',
  '/fl-sh/sw.js',
  '/fl-sh/icons/icon-72x72.png',
  '/fl-sh/icons/icon-96x96.png',
  '/fl-sh/icons/icon-128x128.png',
  '/fl-sh/icons/icon-144x144.png',
  '/fl-sh/icons/icon-152x152.png',
  '/fl-sh/icons/icon-192x192.png',
  '/fl-sh/icons/icon-384x384.png',
  '/fl-sh/icons/icon-512x512.png',
  'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js',
  'https://cdn.tailwindcss.com'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('unpkg.com/peerjs') && 
      !event.request.url.includes('cdn.tailwindcss.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Open the cache and put the new response there
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, show a generic fallback
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/fl-sh/index.html');
            }
            // Return nothing if we can't provide a fallback
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

