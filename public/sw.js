/**
 * KhulaGrow service worker.
 * - App shell + static assets: stale-while-revalidate.
 * - Pages: network-first with cache fallback so the app opens offline.
 * - /api requests are NOT cached here — the app layer (Dexie/IndexedDB)
 *   owns API caching and the offline mutation queue.
 */
const CACHE = "khulagrow-v1";
const APP_SHELL = ["/dashboard", "/batches", "/log", "/tasks", "/more", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return; // app layer handles API offline
  if (url.origin !== location.origin) return;

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json";

  if (isStatic) {
    // Stale-while-revalidate for immutable build assets
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const network = fetch(event.request)
          .then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Network-first for pages
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return (
          cached ||
          caches.match("/dashboard") ||
          new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        );
      })
  );
});
