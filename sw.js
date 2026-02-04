/* sw.js
 * PWA Service Worker – Stable – Safe
 * Scope: UI / Asset caching only
 * Brain-core: READ-ONLY (no access)
 */

const CACHE_NAME = "pwa-nha-dat-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/ui/ui.css",
  "/ui/ui.js"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        })
      );
    }).catch(() => {
      return caches.match("/index.html");
    })
  );
});
