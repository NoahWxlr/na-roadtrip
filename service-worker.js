// Offline-first cache for the road trip app shell.
// Bump CACHE_VERSION on every deploy so users get the new bundle next load.
const CACHE_VERSION = 'roadtrip-v1';
const TILES_CACHE = 'roadtrip-tiles-v1';

const APP_SHELL = [
  './',
  './index.html',
  './js/app.js',
  './js/data.js',
  './style.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(APP_SHELL.map((u) => cache.add(u).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== TILES_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Map tiles → cache-first, populate on demand.
  if (
    url.hostname.endsWith('basemaps.cartocdn.com') ||
    url.hostname.endsWith('tile.openstreetmap.org')
  ) {
    event.respondWith(
      caches.open(TILES_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return cached || new Response('', { status: 504 });
        }
      })
    );
    return;
  }

  // App shell + everything else → cache-first with network fallback.
  // Match ignoring `?v=` cache-bust query so dev cache-busting still hits cache.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        // Refresh in background but serve cached immediately.
        fetch(req).then((resp) => {
          if (resp && resp.ok) {
            caches.open(CACHE_VERSION).then((c) => c.put(req, resp.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req)
        .then((resp) => {
          if (resp && resp.ok && (url.origin === self.location.origin || url.hostname.endsWith('cdnjs.cloudflare.com'))) {
            const copy = resp.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
