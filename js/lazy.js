// lazy.js: 延迟加载低优先级脚本 (hitokoto / maomao / jinzhifuzhi)
; (function () {
    const cfg = window.__APP_CONFIG__ || {};
    const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.defer = true; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    function idle(fn) { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 }); else setTimeout(fn, 1200); }

    // 延迟加载 F12 限制与小猫交互
    idle(() => { loadScript('/js/maomao.js'); loadScript('/js/no-copy.js'); });

    // 一言：智能延迟加载
    if (cfg.enableHitokoto !== false) {
        const target = document.getElementById('hitokoto');
        if (target) {
            let loaded = false;
            const trigger = () => { 
                if (loaded) return; 
                loaded = true; 
                loadScript('/js/hitokoto.js').catch(() => {
                    // 如果脚本加载失败，显示错误信息
                    const link = document.getElementById('hitokoto_text');
                    if (link) {
                        const t = window.__I18N__?.t || (k => k);
                        link.textContent = t('hitokotoError') || '获取一言失败';
                        target.classList.remove('skeleton');
                    }
                });
                obs && obs.disconnect(); 
            };
            
            // 使用 IntersectionObserver 进行视口检测
            const obs = 'IntersectionObserver' in window ? 
                new IntersectionObserver(entries => { 
                    if (entries.some(entry => entry.isIntersecting)) {
                        trigger(); 
                    }
                }, { 
                    rootMargin: '50px' // 提前50px开始加载
                }) : null;
                
            if (obs) {
                obs.observe(target);
            }
            
            // 备用方案：空闲时加载
            idle(trigger);
            
            // 如果用户长时间停留但未滚动到一言位置，也加载（提升用户体验）
            setTimeout(() => {
                if (!loaded && document.visibilityState === 'visible') {
                    trigger();
                }
            }, 10000); // 10秒后加载
        }
    } else {
        // 如果禁用一言，优雅地移除相关元素
        const target = document.getElementById('hitokoto');
        if (target) {
            target.style.display = 'none';
            // 使用 setTimeout 确保样式应用后再移除
            setTimeout(() => target.remove(), 100);
        }
    }
})();
