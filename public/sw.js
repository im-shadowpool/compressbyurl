/* global caches, clients, self */

const CACHE_VERSION = "compress-by-url-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/app-icon.svg"];
const DEVELOPMENT_HOSTS = new Set(["localhost", "127.0.0.1"]);
const IS_DEVELOPMENT = DEVELOPMENT_HOSTS.has(self.location.hostname);

self.addEventListener("install", (event) => {
  if (IS_DEVELOPMENT) {
    self.skipWaiting();
    return;
  }
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (IS_DEVELOPMENT || event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_VERSION).then((cache) => cache.put("/", copy)),
            );
          }
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  const cacheable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/media/") ||
    /\.(?:js|css|wasm|woff2?)$/i.test(url.pathname);

  if (!cacheable) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy)),
          );
        }
        return response;
      });
    }),
  );
});
