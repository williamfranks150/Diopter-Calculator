// sw.js
const CACHE = 'diopter-range-v10'; // bump this every deploy
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// Cache-first for app shell; network-first for everything else.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // App shell
  if (req.mode === 'navigate' || ASSETS.some(a => req.url.endsWith(a.replace('./','')))) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      return fresh;
    })());
    return;
  }

  // Network-first (lets your online lens DB update when online)
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      return fresh;
    } catch {
      const cached = await caches.match(req);
      if (cached) return cached;
      return caches.match('./index.html');
    }
  })());
});
