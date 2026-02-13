const CACHE_NAME = "sim-tracker-pro-v1";

const URLS_TO_CACHE = [
  "/",
  "/login",
  "/owner/dashboard",
  "/owner/sims",
  "/owner/reports/sales",
  "/owner/reports/corrupted",
  "/owner/staff",
  "/staff/dashboard",
  "/staff/sale",
  "/staff/report-issue",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => undefined);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { request } = event;

  // Network-first for navigation and API, cache-first for static assets
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((response) => response || caches.match("/login"))
      )
    );
    return;
  }

  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
});

