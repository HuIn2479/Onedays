// lazy.js: 延迟加载低优先级脚本 (hitokoto / maomao / jinzhifuzhi)
; (function () {
    const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.defer = true; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    function idle(fn) { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 }); else setTimeout(fn, 1200); }

    // 延迟加载 F12 限制与小猫交互
    idle(() => { loadScript('/js/maomao.js'); loadScript('/js/jinzhifuzhi.js'); });

    // 一言：进入视口或空闲再加载
    const target = document.getElementById('hitokoto');
    if (target) {
        let loaded = false;
        const trigger = () => { if (loaded) return; loaded = true; loadScript('/js/hitokoto.js'); obs && obs.disconnect(); };
        const obs = 'IntersectionObserver' in window ? new IntersectionObserver(e => { if (e.some(x => x.isIntersecting)) trigger(); }) : null;
        if (obs) obs.observe(target); idle(trigger);
    } else {
        idle(() => loadScript('/js/hitokoto.js'));
    }
})();
