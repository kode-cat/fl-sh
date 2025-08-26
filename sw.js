const CACHE_NAME = 'fl-sh-cache-v2';

// Determine the base path - handles both GitHub Pages and Cloudflare Pages
const getBasePath = () => {
  const path = self.location.pathname;
  // For GitHub Pages: /fl-sh/sw.js
  if (path.includes('/fl-sh/')) {
    return '/fl-sh/';
  }
  // For Cloudflare Pages or root domain: /sw.js
  return '/';
};

const BASE_PATH = getBasePath();

// Core app assets
const APP_ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'sw.js',
  BASE_PATH + 'pwa.js'
];

// External dependencies to cache
const EXTERNAL_ASSETS = [
  'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js',
  'https://cdn.tailwindcss.com'
];

// Combine all assets to cache
const ASSETS_TO_CACHE = [
  ...APP_ASSETS,
  ...EXTERNAL_ASSETS
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
  const url = new URL(event.request.url);
  
  // Special handling for PeerJS and Tailwind CSS
  const isPeerJS = url.href.includes('unpkg.com/peerjs');
  const isTailwind = url.href.includes('cdn.tailwindcss.com');
  const isExternal = isPeerJS || isTailwind;
  
  // For same-origin requests or our explicitly allowed external resources
  if (url.origin === self.location.origin || isExternal) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return the response from the cached version
          if (response) {
            return response;
          }

          // Not in cache - fetch from network
          return fetch(event.request.clone())
            .then(networkResponse => {
              // Don't cache opaque responses (CORS issues)
              if (!networkResponse || networkResponse.status !== 200) {
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
                return caches.match(BASE_PATH + 'index.html');
              }
              
              // For PeerJS specifically, provide a fallback implementation
              if (isPeerJS) {
                return caches.match('/offline-peerjs-fallback.js')
                  .then(fallbackResponse => {
                    if (fallbackResponse) {
                      return fallbackResponse;
                    }
                    // If no fallback is cached, return a meaningful error
                    return new Response(
                      'PeerJS is not available offline. Please reconnect to the internet.',
                      { status: 503, headers: { 'Content-Type': 'text/plain' } }
                    );
                  });
              }
              
              // Return nothing if we can't provide a fallback
              return new Response(
                'Network error happened. This resource is not available offline.',
                { status: 503, headers: { 'Content-Type': 'text/plain' } }
              );
            });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
