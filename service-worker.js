const CACHE = "postventa-canarias-v4";

/**
 * Precache SOLO rutas que existen en el ZIP.
 * Objetivo: PWA estable en iPhone + evitar “no veo cambios”.
 */
const ASSETS = [
  "./",
  "./index.html",
  "./nuevo-parte.html",
  "./instalacion.html",
  "./reparacion.html",
  "./mantenimiento.html",
  "./historial.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",

  // Imágenes / iconos (existentes en el ZIP)
  "./public/assets/img/logo-canarias-accesible-2.png",
  "./public/assets/img/logo-canarias-accesible.png",
  "./public/assets/icons/icon-180.png",
  "./public/assets/icons/icono-canarias-accesible-192.png",
  "./public/assets/icons/icono-canarias-accesible-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {
      // Si falla precache (p.ej. iOS raro), no rompemos la instalación.
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Runtime cache del CDN (jsPDF). Así el PDF sigue funcionando si vuelves a abrir sin red.
  if (url.origin === "https://cdn.jsdelivr.net" && url.pathname.includes("/jspdf@")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        });
      }).catch(() => fetch(req))
    );
    return;
  }

  // HTML / navegación: NETWORK FIRST (para ver cambios siempre)
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Assets: CACHE FIRST
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
