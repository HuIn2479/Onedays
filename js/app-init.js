// 初始化：年份 + Service Worker 注册 + Cloudflare Pages 环境提示
(function () {
  const cfg = window.__APP_CONFIG__ || {};
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  // 应用标题/副标题
  if (cfg.title) {
    const t = document.getElementById("siteTitle");
    if (t) t.textContent = cfg.title;
    document.title = cfg.title + "'S Home";
  }
  if (cfg.subtitle) {
    const s = document.getElementById("siteSubtitle");
    if (s) s.textContent = cfg.subtitle;
  }

  // Splash 逻辑
  const splash = document.getElementById("splash");
  if (splash && cfg.enableSplash) {
    const start = performance.now();
    let finished = false;
    function fade() { if (finished) return; finished = true; splash.classList.add('fade-out'); }
    function finish() {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, (cfg.splashMinDuration || 0) - elapsed);
      setTimeout(fade, wait);
    }
    window.addEventListener('load', () => {
      if (cfg.removeSplashIfFast) {
        // 如果资源加载极快(<400ms)，加速展示体验
        const elapsed = performance.now() - start;
        if (elapsed < 400) { setTimeout(finish, 200 - elapsed); return; }
      }
      finish();
    });
    setTimeout(finish, 3200); // 保险
  } else if (splash) {
    splash.remove();
  }

  // 移除 PWA：注销已存在的 Service Worker 与旧缓存
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
  if ("caches" in window) {
    caches.keys().then(keys => keys.filter(k => k.startsWith("onedays-"))
      .forEach(k => caches.delete(k)));
  }
})();
