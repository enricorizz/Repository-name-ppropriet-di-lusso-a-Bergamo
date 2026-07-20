const CACHE_NAME = "rizzetti-agent-v1";
const FALLBACK_PAGE = "./index.html";
const OFFLINE_ASSETS = [
  FALLBACK_PAGE,
  "./styles.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(async (networkResponse) => {
          const responseClone = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseClone);
          return networkResponse;
        })
        .catch(async () => {
          const fallbackResponse = await caches.match(FALLBACK_PAGE);

          return (
            fallbackResponse ||
            new Response(
              "Questa pagina non è disponibile offline in questo momento. Verifica la connessione, ricarica il sito e riprova.",
              {
                status: 503,
                statusText: "Offline",
                headers: {
                  "Content-Type": "text/plain; charset=utf-8",
                },
              },
            )
          );
        });
    })
  );
});
