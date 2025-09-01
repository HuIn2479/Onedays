const CACHE_NAME = "onedays-v15"; // core merge + lazy load
// 精简预缓存（核心首屏 + 样式 + PWA 基础）
const ASSETS = [
  "/",
  "/index.html",
  "/css/index.css",
  "/css/maomao.css",
  "/js/config.js",
  "/js/core.js",
  "/js/theme.js",
  "/js/announcement.js",
  "/js/extras.js",
  "/js/loader.js",
  "/js/app-init.js",
  "/manifest.webmanifest"
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
