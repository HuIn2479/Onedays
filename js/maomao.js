// 轻量随机位置调整 (不依赖 jQuery)
const rand = (a, b = a) => Math.floor(Math.random() * (b - a + 1)) + a;
let lastMove = 0;
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
  // 只初始化一次
  if (el.__maomaoInited) return true;
  el.__maomaoInited = true;
  const cfg = window.__APP_CONFIG__ || {};
  const curTrans = getComputedStyle(el).transition || "";
  if (!/bottom|right/.test(curTrans)) {
    el.style.transition =
      (curTrans ? curTrans + "," : "") +
      "bottom .8s cubic-bezier(.4,0,.2,1), right .8s cubic-bezier(.4,0,.2,1)";
  }
  repositionCat();
  ["mouseleave", "click", "touchend", "mouseenter"].forEach((ev) =>
    el.addEventListener(ev, repositionCat, { passive: true })
  );
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !e.repeat) repositionCat();
  });
  // 安全：5 秒后还没再次移动则强制一次（避免阻塞或首帧未执行）
  setTimeout(() => {
    if (lastMove === 0) repositionCat();
  }, 5000);

  // === 定时自动漂移 ===
  let autoTimer = null;
  const base = parseInt(cfg.catDriftInterval || 0, 10);
  function schedule() {
    if (!base) return; // disabled
    clearTimeout(autoTimer);
    // 随机浮动 70%~140% 间隔，更自然
    const next = base * (0.7 + Math.random() * 0.7);
    autoTimer = setTimeout(() => {
      repositionCat();
      schedule();
    }, next);
  }
  if (base > 0) {
    schedule();
    // 交互后重新计时
    ["click", "mousemove", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, () => base && schedule(), { passive: true })
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(autoTimer);
      else schedule();
    });
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
