// 轻量随机位置调整 (不依赖 jQuery)
const rand = (a, b = a) => Math.floor(Math.random() * (b - a + 1)) + a;
let lastMove = 0;
let globalCatEl = null; // 缓存引用，便于清理
function repositionCat() {
  const el = document.getElementById("maomao");
  if (!el) return;
  const now = Date.now();
  if (now - lastMove < 250) return; // 节流
  lastMove = now;
  const bottomVH = rand(5, 80); // 垂直范围
  const rightPx = rand(-5, -2); // 水平微调，保持靠右不遮挡主体
  el.style.bottom = bottomVH + "vh";
  el.style.right = rightPx + "px";
}

function initMaomao() {
  const el = document.getElementById("maomao");
  if (!el) return false;
  if (el.__maomaoInited) return true; // 只初始化一次
  el.__maomaoInited = true;
  globalCatEl = el;
  const cfg = window.__APP_CONFIG__ || {};
  const curTrans = getComputedStyle(el).transition || "";
  if (!/bottom|right/.test(curTrans)) {
    el.style.transition =
      (curTrans ? curTrans + "," : "") +
      "bottom .8s cubic-bezier(.4,0,.2,1), right .8s cubic-bezier(.4,0,.2,1)";
  }
  repositionCat();
  const hoverEvents = ["mouseleave", "click", "touchend", "mouseenter"];
  hoverEvents.forEach((ev) => el.addEventListener(ev, repositionCat, { passive: true }));
  const keyListener = (e) => { if (e.code === "Space" && !e.repeat) repositionCat(); };
  window.addEventListener("keydown", keyListener);
  // 安全兜底
  const safetyTimer = setTimeout(() => { if (lastMove === 0) repositionCat(); }, 5000);

  // === 定时自动漂移 ===
  let autoTimer = null;
  const base = parseInt(cfg.catDriftInterval || 0, 10);
  function schedule() {
    if (!base) return; // disabled
    clearTimeout(autoTimer);
    const next = base * (0.7 + Math.random() * 0.7); // 自然浮动
    autoTimer = setTimeout(() => { repositionCat(); schedule(); }, next);
    el.__mmAutoTimer = autoTimer;
  }
  if (base > 0) {
    schedule();
    const resetEvents = ["click", "mousemove", "touchstart"];
    const resetHandler = () => base && schedule();
    resetEvents.forEach((ev) => window.addEventListener(ev, resetHandler, { passive: true }));
    const visListener = () => { if (document.hidden) clearTimeout(autoTimer); else schedule(); };
    document.addEventListener("visibilitychange", visListener);
    el.__mmResetEvents = resetEvents;
    el.__mmResetHandler = resetHandler;
    el.__mmVisListener = visListener;
  }

  // 暴露清理函数
  if (!window.detachMaomao) {
    window.detachMaomao = function () {
      if (!globalCatEl) return;
      try {
        hoverEvents.forEach((ev) => globalCatEl.removeEventListener(ev, repositionCat));
        window.removeEventListener("keydown", keyListener);
        clearTimeout(safetyTimer);
        if (globalCatEl.__mmAutoTimer) clearTimeout(globalCatEl.__mmAutoTimer);
        if (globalCatEl.__mmResetEvents && globalCatEl.__mmResetHandler) {
          globalCatEl.__mmResetEvents.forEach((ev) => window.removeEventListener(ev, globalCatEl.__mmResetHandler));
        }
        if (globalCatEl.__mmVisListener) document.removeEventListener("visibilitychange", globalCatEl.__mmVisListener);
      } catch (_) { }
      globalCatEl.__maomaoInited = false;
      globalCatEl = null;
    };
  }
  return true;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMaomao, { once: true });
} else {
  // 脚本被懒加载时 DOMContentLoaded 已触发，需直接执行
  initMaomao();
}

// 兼容旧内联调用
window.duoMaomao = repositionCat;
