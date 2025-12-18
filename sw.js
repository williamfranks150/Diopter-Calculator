// sw.js
const CACHE = 'diopter-range-v2';
const ASSETS = [
  './',
  './index.html',
  './sw.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(e.request);
      return fresh;
    } catch {
      return caches.match('./index.html');
    }
  })());
});
