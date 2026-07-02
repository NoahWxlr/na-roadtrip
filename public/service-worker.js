// Self-destructing service worker.
//
// The previous static NA Road Trip site registered an offline-first,
// cache-first service worker at /service-worker.js (scope "/"). After the
// Next.js rebuild that path would otherwise 404 — and a 404 does NOT remove an
// installed service worker, so returning visitors would keep being served the
// old cached site indefinitely.
//
// This replacement takes over on the next update check, wipes every cache,
// unregisters itself, and reloads open tabs so they load the new site from the
// network. It intentionally does no caching of its own.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Nuke all caches left behind by the old SW (app shell, tiles, etc.).
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch (e) {
        // ignore
      }

      await self.clients.claim()

      // Unregister this SW so future loads hit the network directly.
      try {
        await self.registration.unregister()
      } catch (e) {
        // ignore
      }

      // Reload any open tabs so they pick up the new site immediately.
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => client.navigate(client.url))
    })(),
  )
})

// While this SW is briefly active, always go to the network — never serve a
// stale cached response.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(
      () => new Response('', { status: 504, statusText: 'Gateway Timeout' }),
    ),
  )
})
