(function () {
  const cfg = window.__APP_CONFIG__ || {};
  const {
    title, subtitle,
    enableSplash, splashMinDuration = 0,
    removeSplashIfFast,
  } = cfg;

  // 基础文案注入
  const yearEl = document.getElementById('year');
  yearEl && (yearEl.textContent = new Date().getFullYear());
  if (title) {
    const t = document.getElementById('siteTitle'); t && (t.textContent = title);
    document.title = title + "'S Home";
  }
  if (subtitle) {
    const s = document.getElementById('siteSubtitle'); s && (s.textContent = subtitle);
  }

  // Splash 处理（最小停留 + 提前结束 + 兜底）
  (function handleSplash(){
    const splash = document.getElementById('splash');
    if(!splash){ return; }
    if(!enableSplash){ splash.remove(); return; }
    const START = performance.now();
    const FAST_THRESHOLD = 400;      // 资源极快加载阈值
    const QUICK_EXTRA = 200;         // 极快时仍给予的最小展示（视觉稳定）
    const HARD_TIMEOUT = 4000;       // 兜底最晚移除时间
    let done=false;
    function fade(){
      if(done) return; done = true;
      splash.classList.add('fade-out');
      document.dispatchEvent(new CustomEvent('splash:fade'));
    }
    function finish(){
      const elapsed = performance.now() - START;
      const wait = Math.max(0, splashMinDuration - elapsed);
      setTimeout(fade, wait);
    }
    // 页面完全加载后决定是否加速
    window.addEventListener('load', () => {
      if(removeSplashIfFast){
        const elapsed = performance.now() - START;
        if(elapsed < FAST_THRESHOLD){
            // 保证至少 QUICK_EXTRA 的视觉存在时间 (避免闪白)
            const remain = Math.max(0, QUICK_EXTRA - elapsed);
            setTimeout(finish, remain);
            return;
        }
      }
      finish();
    }, { once:true });
    // 兜底
    setTimeout(fade, HARD_TIMEOUT);
  })();

  (function cleanLegacyPWA(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistrations()
        .then(regs => regs.forEach(r => r.unregister()))
        .catch(()=>{});
    }
    if('caches' in window){
      caches.keys()
        .then(keys => keys.filter(k => k.startsWith('onedays-')).forEach(k => caches.delete(k)))
        .catch(()=>{});
    }
  })();

  // 完成信号 (同步调用即可，延迟特性由外部监听 splash:fade)
  document.dispatchEvent(new CustomEvent('app:init'));
})();
