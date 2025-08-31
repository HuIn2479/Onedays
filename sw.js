const CACHE_NAME = "onedays-v7"; // extras features
const ASSETS = [
  "/",
  "/index.html",
  "/css/index.css",
  "/css/maomao.css",
  "/js/time.js",
  "/js/maomao.js",
  "/js/jinzhifuzhi.js",
  "/js/theme.js",
  "/js/reveal.js",
  "/js/config.js",
  "/js/loader.js",
  "/js/extras.js",
  "/js/hitokoto.js",
  "/manifest.webmanifest",
  "/js/app-init.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // 不缓存错误页面或某些敏感目录
  if (/\/error\//.test(url.pathname) || url.pathname.startsWith("/.well-known"))
    return;
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((resp) => {
          // 仅缓存成功的基本类型
          if (resp.ok && ["basic", "cors"].includes(resp.type)) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return resp;
        })
        .catch(() => cached);
    })
  );
});
