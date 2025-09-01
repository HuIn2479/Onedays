// core.js: 合并 reveal / enhance / time 逻辑 + 轻量首屏优化
(function () {
    const cfg = window.__APP_CONFIG__ || {};
    // === Runtime 计时 ===
    const START_AT = new Date(
        cfg.launchDate ||
        (cfg.meta && cfg.meta.launchDate) ||
        "2021-02-27T00:00:00+08:00"
    ).getTime();
    let t1, t2, runtimeTimer;
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
        if (t1) t1.textContent = `「悄悄运行${d}天`;
        if (t2) t2.textContent = `${pad(h)}小时${pad(m)}分${pad(s)}秒」`;
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
        // 缓存 runtime DOM
        t1 = document.getElementById("timeDate");
        t2 = document.getElementById("times");
        renderRuntime();
        runtimeTimer = setInterval(renderRuntime, 1000);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                clearInterval(runtimeTimer);
                runtimeTimer = null;
            } else if (!runtimeTimer) {
                renderRuntime();
                runtimeTimer = setInterval(renderRuntime, 1000);
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

        // 一言骨架去除 (轮询直到内容加载或超时)
        const hitokotoWrap = document.getElementById("hitokoto");
        if (hitokotoWrap) {
            let n = 0;
            const poll = setInterval(() => {
                const a = document.getElementById("hitokoto_text");
                if (a && a.textContent && !/加载中/i.test(a.textContent)) {
                    removeSkeleton(hitokotoWrap);
                    clearInterval(poll);
                }
                if (++n >= 40) clearInterval(poll);
            }, 100);
        }

        initReveal();
    });
})();
