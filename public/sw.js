const CACHE_KEY = "pavagexpert-v2";
const STATIC_CACHE = "pavagexpert-static-v2";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/images/logo.svg",
  "/images/icon-192.svg",
  "/images/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_KEY).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_KEY && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const phone = data.phone || "+15142431580";
  self.registration.showNotification(data.title || "Nouveau projet", {
    body: data.body || "Un nouveau projet vient d'être publié.",
    icon: "/images/icon-192.svg",
    badge: "/images/icon-192.svg",
    tag: "new-job",
    data: { url: data.url || "/fr/jobs", phone },
    actions: [
      { action: "open", title: "Voir le projet" },
      { action: "call", title: `Appeler` },
    ],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "call") {
    event.waitUntil(clients.openWindow(`tel:${event.notification.data.phone}`));
  } else {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname === OFFLINE_URL) return;

  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/images/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_KEY);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(OFFLINE_URL);
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE_KEY);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}
