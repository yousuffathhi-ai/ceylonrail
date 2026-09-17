// Ceylon Rail Service Worker - Offline Route Map & Schedule Caching Strategy
const CACHE_NAME = 'ceylon-rail-v2';
const MAP_CACHE_NAME = 'ceylon-rail-map-data-v2';

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/public/googlee23b95ba50fb8bc4.html'
];

// Install Event: Pre-cache critical offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(CRITICAL_ASSETS).catch(() => {})),
      caches.open(MAP_CACHE_NAME).then((cache) => {
        // Pre-cache placeholder map markers and route coordinates
        return cache.put(
          new Request('/offline-map-status'),
          new Response(JSON.stringify({ status: 'cached', version: '2.0', timestamp: Date.now() }), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== MAP_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate for Map Data & Cache-First for Offline Resilience
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle map data and timetable assets with Stale-While-Revalidate
  if (
    url.pathname.includes('/data/') ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('timetable') ||
    url.pathname.includes('station') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg')
  ) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // General App Shell caching: Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Network offline. Ceylon Rail cached route map is available offline.', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
