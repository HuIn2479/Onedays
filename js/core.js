(function () {
    const cfg = window.__APP_CONFIG__ || {};
    // === Runtime 计时 ===
    const START_AT = new Date(
        cfg.launchDate ||
        (cfg.meta && cfg.meta.launchDate) ||
        "2021-02-27T00:00:00+08:00"
    ).getTime();
    let t1, t2; // runtimeTimer 改为 rAF
    let __rtLastSec = -1, __rtRafId = null;
    function pad(n) {
        return n < 10 ? "0" + n : "" + n;
    }
    function renderRuntime() {
        const diff = Date.now() - START_AT;
        const d = Math.floor(diff / 86400000);
        let rest = diff % 86400000;
        const h = Math.floor(rest / 3600000);
        rest %= 3600000;
        const m = Math.floor(rest / 60000);
        rest %= 60000;
        const s = Math.floor(rest / 1000);
        const t = window.__I18N__?.t || (k => k);
        if (t1) t1.textContent = `${t('runtimePrefix')}${d}${t('runtimeSuffix')}`;
        if (t2) t2.textContent = `${pad(h)}${t('runtimeHour')}${pad(m)}${t('runtimeMinute')}${pad(s)}${t('runtimeSecond')}`;
    }

    // === Skeleton -> Fade ===
    function removeSkeleton(el) {
        if (!el) return;
        el.classList.remove("skeleton");
        [...el.children].forEach((c) => (c.style.visibility = ""));
        el.classList.add("fade-in");
    }

    // === Reveal (IntersectionObserver) ===
    function initReveal() {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.querySelectorAll(".reveal").forEach((box) => {
                box.classList.add("reveal-in");
            });
            return;
        }
        const options = { threshold: 0.1, rootMargin: "0px 0px -5% 0px" };
        const groups = new Set();
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    const box = e.target;
                    if (!box.classList.contains("reveal-in")) {
                        [...box.children].forEach((ch) => {
                            if (!ch.classList.contains("reveal-item"))
                                ch.classList.add("reveal-item");
                        });
                        requestAnimationFrame(() => box.classList.add("reveal-in"));
                    }
                    obs.unobserve(box);
                }
            });
        }, options);
        document.querySelectorAll(".reveal").forEach((el) => {
            if (!groups.has(el)) {
                groups.add(el);
                obs.observe(el);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        function createToast(opts) {
            if (!opts) return; const { text = '', duration = 2400, id, variant = 'accent', closable = false } = opts;
            if (id && document.querySelector(`[data-toast-id="${id}"]`)) return; // 防重复
            let wrap = document.getElementById('__toast_container');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.id = '__toast_container';
                wrap.className = 'toast-container';
                wrap.setAttribute('role', 'status');
                wrap.setAttribute('aria-live', 'polite');
                document.body.appendChild(wrap);
            }
            // 队列上限（4 个）
            const MAX = 4;
            if (wrap.children.length >= MAX) {
                // 移除最早的（跳过具有相同 id 的保留）
                for (let i = 0; i < wrap.children.length; i++) {
                    const c = wrap.children[i]; c.classList.add('toast-leave');
                    c.addEventListener('animationend', () => c.remove(), { once: true });
                    break;
                }
            }
            const el = document.createElement('div');
            el.dataset.toastId = id || '';
            el.className = `toast toast-${variant}`;
            el.textContent = text;
            if (closable) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'toast-close';
                const t = window.__I18N__?.t || (k => k);
                btn.setAttribute('aria-label', t('close'));
                btn.innerHTML = '×';
                btn.addEventListener('click', () => dismiss());
                el.appendChild(btn);
            }
            // 点击本体快速关闭
            el.addEventListener('click', () => dismiss());
            wrap.appendChild(el);
            // 触发入场
            requestAnimationFrame(() => el.classList.add('show'));
            const dismiss = () => {
                if (!el.isConnected) return;
                el.classList.remove('show');
                el.classList.add('toast-leave');
                el.addEventListener('animationend', () => el.remove(), { once: true });
            };
            if (duration > 0) setTimeout(dismiss, duration);
            return el;
        }
        // 暴露全局，供其它脚本复用（避免重复实现）
        if (!window.createToast) window.createToast = createToast;
        // 在线/离线状态提示
        if (!window.__NET_STATUS_BOUND__) {
            window.__NET_STATUS_BOUND__ = 1;
            const t = window.__I18N__?.t || (k => k);
            window.addEventListener('offline', () => createToast({ text: t('networkOffline'), variant: 'danger', id: 'net-off', duration: 3000 }));
            window.addEventListener('online', () => createToast({ text: t('networkOnline'), variant: 'success', id: 'net-on', duration: 2500 }));
        }

        // === Runtime 控制 ===
        if (cfg.enableRuntime) {
            // 缓存 runtime DOM
            t1 = document.getElementById('timeDate');
            t2 = document.getElementById('times');
            function runtimeLoop() {
                if (document.hidden) { __rtRafId = null; return; }
                const diffSec = ((Date.now() - START_AT) / 1000) | 0;
                if (diffSec !== __rtLastSec) {
                    __rtLastSec = diffSec;
                    renderRuntime();
                }
                __rtRafId = requestAnimationFrame(runtimeLoop);
            }
            runtimeLoop();
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && __rtRafId == null) {
                    // 立刻刷新并重启循环
                    __rtLastSec = -1; // 强制下一帧更新
                    runtimeLoop();
                }
            });

            // skeleton remove for runtime
            const rt = document.querySelector(".runtime.skeleton");
            if (rt) {
                setTimeout(
                    () => removeSkeleton(rt),
                    cfg.skeletonFadeDelay || cfg.splash?.skeletonFadeDelay || 120
                );
            }
        } else {
            // 如果禁用运行时间，隐藏运行时间元素
            const runtimeEl = document.querySelector(".runtime");
            if (runtimeEl) {
                runtimeEl.style.display = 'none';
            }
        }

        // 一言骨架去除：MutationObserver 优先，退化到定时器兜底
        (function initHitokoto() {
            const wrap = document.getElementById('hitokoto'); if (!wrap) return;
            const target = document.getElementById('hitokoto_text'); if (!target) return;
            const t = window.__I18N__?.t || (k => k);
            const done = () => { if (wrap.classList.contains('skeleton')) removeSkeleton(wrap); obs && obs.disconnect(); clearTimeout(killTimer); };
            let obs; try {
                obs = new MutationObserver(() => { if (target.textContent && !/加载中|Loading|読み込み中/i.test(target.textContent)) done(); });
                obs.observe(target, { characterData: true, subtree: true, childList: true });
            } catch (_) { /* ignore */ }
            // 兜底超时（4s）
            const killTimer = setTimeout(done, 4000);
            // 若脚本很快已填充
            if (target.textContent && !/加载中|Loading|読み込み中/i.test(target.textContent)) done();
        })();

        initReveal();

        // === 彩蛋 ===
        // 1. Konami 代码 -> 显示一条控制台消息 + 小震动 + 临时彩色滤镜
        if (cfg.enableKonami) {
            const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]; let idx = 0; let fired = false;
            window.addEventListener('keydown', e => {
                if (fired) return;
                if (e.metaKey || e.ctrlKey || e.altKey) return; // 忽略组合键
                if (e.key === seq[idx]) { idx++; if (idx === seq.length) { fired = true; konamiFire(); } } else { idx = e.key === seq[0] ? 1 : 0; }
            });
            function konamiFire() {
                console.log('%cKonami!', 'padding:4px 8px;background:#222;color:#fff;border-radius:4px');
                try { if (navigator.vibrate) navigator.vibrate([28, 40, 24]); } catch (_) {/* ignore */ }
                const body = document.body; body.style.transition = 'filter 1.2s ease'; body.style.filter = 'hue-rotate(360deg)'; setTimeout(() => body.style.filter = '', 1200);
                const t = window.__I18N__?.t || (k => k);
                createToast({ text: cfg.konamiToastText || t('konamiEasterEgg'), id: 'konami-eg', variant: 'accent', duration: 3000 });
            }
        }
        // 2. 标题连点 -> 切换灰度模式 / 显示提示
        if (cfg.enableTitleClicks) {
            const title = document.getElementById('siteTitle');
            if (title) {
                let clicks = []; let grayscale = false; const need = cfg.titleClickThreshold || 7; const win = cfg.titleClickWindow || 2000;
                function prune() { const now = Date.now(); clicks = clicks.filter(t => now - t < win); }
                function toggle() {
                    grayscale = !grayscale; document.documentElement.style.filter = grayscale ? 'grayscale(1)' : 'none';
                    const t = window.__I18N__?.t || (k => k);
                    createToast({ text: grayscale ? t('grayscaleModeOn') : t('grayscaleModeOff'), variant: 'neutral', duration: 2000 });
                }
                title.addEventListener('click', () => { prune(); clicks.push(Date.now()); if (clicks.length >= need) { clicks = []; toggle(); } });
            }
        }
    });
})();
