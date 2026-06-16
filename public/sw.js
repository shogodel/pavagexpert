const CACHE = "pavagexpert-v1";
const PRECACHE_URLS = [
  "/fr/jobs",
  "/fr/login",
  "/images/logo.svg",
  "/images/icon-192.svg",
  "/images/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Nouveau projet", {
    body: data.body || "Un nouveau projet vient d'être publié.",
    icon: "/images/icon-192.svg",
    badge: "/images/icon-192.svg",
    tag: "new-job",
    data: { url: data.url || "/fr/jobs" },
    actions: [
      { action: "open", title: "Voir le projet" },
      { action: "call", title: "Appeler 514-243-1580" },
    ],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "call") {
    event.waitUntil(clients.openWindow("tel:5142431580"));
  } else {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
