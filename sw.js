// Offline cache. The page itself is fetched fresh whenever there is internet (so updates arrive on the
// next open) and comes from the cache only when offline. Icons, fonts and the rest are cache-first.
const CACHE = "gym-daftar-__VERSION__";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  // cache: "reload" skips the browser's HTTP cache, so a new version never stores an old page.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // Network first, with a short timeout so a weak gym signal still opens the saved copy quickly.
    e.respondWith(caches.open(CACHE).then(async c => {
      const fresh = fetch(req, { cache: "no-store" }).then(r => { if (r.ok) c.put("index.html", r.clone()); return r; });
      const timeout = new Promise(res => setTimeout(res, 3000));
      try {
        const r = await Promise.race([fresh, timeout]);
        if (r) return r;
      } catch (err) {}
      return (await c.match("index.html")) || fresh;
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
