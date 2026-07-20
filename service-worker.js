const CACHE_NAME = "rizzetti-agent-v2";
const FALLBACK_PAGE = "./index.html";
const OFFLINE_ASSETS = [
  FALLBACK_PAGE,
  "./404.html",
  "./styles.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

function offlineTextResponse() {
  return new Response(
    "Questa pagina non è disponibile offline in questo momento. Verifica la connessione, ricarica il sito e riprova.",
    {
      status: 503,
      statusText: "Offline",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}

async function navigationFallbackResponse() {
  return (await caches.match(FALLBACK_PAGE)) || offlineTextResponse();
}

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
    (async () => {
      const isNavigationRequest = event.request.mode === "navigate";
      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);

        if (isNavigationRequest && !networkResponse.ok) {
          return navigationFallbackResponse();
        }

        if (networkResponse.ok && new URL(event.request.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch {
        if (isNavigationRequest) {
          return navigationFallbackResponse();
        }

        return offlineTextResponse();
      }
    })()
  );
});
