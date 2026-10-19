// Offline for the workshop: the world (≈ 15 MB) is precached on first visit; everything else
// same-origin is cached as it is fetched. Bump VERSION when the world assets change.
const VERSION = "emberwatch-v1";
const WORLD = ["color.jpg", "hero_color.jpg", "normal.png", "height.bin", "hero_veg.png", "world.json", "parcels.json", "roads.json"].map((f) => `world/${f}`);

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    const shell = await fetch("precache.json").then((r) => r.json()).catch(() => []);
    await c.addAll(["./", ...WORLD, ...shell]);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Pages: network first so a redeploy shows up; fall back to cache offline.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return r;
  })));
});
