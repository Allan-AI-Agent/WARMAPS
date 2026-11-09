/* WarMaps service worker — KILL SWITCH (v01.08.14)
   The v01.08.11-13 worker caused version REGRESSION on at least one device
   (tablet fell from v01.08.12 back to v01.08.09). Network-first still falls back
   to cache on any slow/failed request, which on a constrained device means the
   stale copy wins routinely. Not worth it for fullscreen.
   This worker deletes every cache, unregisters itself, and reloads open clients. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    try {
      const cs = await self.clients.matchAll({ type: 'window' });
      cs.forEach(function (c) { try { c.navigate(c.url); } catch (_) {} });
    } catch (_) {}
  })());
});
/* Deliberately NO fetch handler — every request goes straight to the network. */
