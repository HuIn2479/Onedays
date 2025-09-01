// 公告跑马灯
(function () {
    const cfg = window.__APP_CONFIG__ || {};
    if (!cfg.enableAnnouncement) return;
    const box = document.getElementById('announcement');
    if (!box) return;
    const textEl = box.querySelector('.ann-text');
    const iconEl = box.querySelector('.ann-icon');
    const closeBtn = box.querySelector('.ann-close');
    const msgs = (cfg.announcementMessages || []).filter(Boolean);
    // 若 update-check / 其他脚本在本脚本前收集了待添加消息
    if (Array.isArray(window.__ANN_PENDING) && window.__ANN_PENDING.length) {
        msgs.push(...window.__ANN_PENDING.splice(0));
    }
    if (!msgs.length) { box.remove(); return; }

    const storeKey = cfg.announcementDismissKey || 'ann-v1';
    if (localStorage.getItem(storeKey)) { box.remove(); return; }

    // 样式模式
    const styleMode = (cfg.announcementStyle || 'bar').toLowerCase();
    if (styleMode === 'card') {
        box.classList.add('announcement-card');
    }

    // 图标
    if (iconEl) {
        const icon = cfg.announcementIcon || '📢';
        iconEl.textContent = icon;
    }
    // 关闭按钮
    if (cfg.enableAnnouncementClose && closeBtn) {
        closeBtn.hidden = false;
        closeBtn.addEventListener('click', () => {
            localStorage.setItem(storeKey, '1');
            box.classList.add('ann-hide');
            setTimeout(() => box.remove(), 400);
        });
    }

    let idx = 0;
    function nextMsg() { return msgs[(idx++) % msgs.length]; }
    const speed = cfg.announcementScrollSpeed || 60; // px/s

    // 把所有消息用分隔符串联再重复一份实现无缝滚动
    let marquee = true;
    if (styleMode === 'card') {
        // 卡片样式：单条轮播淡入淡出，不使用长滚动
        marquee = msgs.length > 1; // 多条时才循环
    }

    if (styleMode === 'card') {
        // 双缓冲：用两个 span 实现交叉淡入淡出
        const duration = Math.max(1200, cfg.announcementCycleInterval || 4800);
        const trans = Math.min(duration - 600, cfg.announcementTransition || 500);
        const progressEnabled = !!cfg.enableAnnouncementProgress;
        // 构建双层容器
        const wrap = document.createElement('div');
        wrap.className = 'ann-stack';
        const a = document.createElement('span');
        const b = document.createElement('span');
        a.className = 'ann-pane active';
        b.className = 'ann-pane';
        wrap.appendChild(a); wrap.appendChild(b);
        textEl.replaceWith(wrap); // 用堆叠替换
        let cur = 0, next = 1, index = 0;
        const panes = [a, b];
        function setPane(p, msg) {
            p.textContent = msg;
        }
        setPane(panes[cur], msgs[index]);
        index = (index + 1) % msgs.length;
        if (progressEnabled) {
            const bar = document.createElement('div');
            bar.className = 'ann-progress';
            box.appendChild(bar);
            function animateProgress() {
                bar.style.animation = 'none';
                // 触发重绘
                bar.offsetHeight;
                bar.style.setProperty('--ann-progress-dur', (duration) + 'ms');
                bar.style.animation = 'ann-progress var(--ann-progress-dur) linear';
            }
            animateProgress();
            box.addEventListener('ann-cycle', animateProgress);
        }
        function cycle() {
            const oldPane = panes[cur];
            const newPane = panes[next];
            setPane(newPane, msgs[index]);
            index = (index + 1) % msgs.length;
            requestAnimationFrame(() => {
                oldPane.classList.remove('active');
                newPane.classList.add('active');
                oldPane.style.setProperty('--ann-trans', trans + 'ms');
                newPane.style.setProperty('--ann-trans', trans + 'ms');
            });
            cur = next; next = cur ? 0 : 1;
            box.dispatchEvent(new CustomEvent('ann-cycle'));
        }
        if (marquee) {
            setInterval(cycle, duration);
        }
    } else {
        const sep = ' \u2022 ';
        function rebuildMarquee() {
            const one = msgs.join(sep);
            const full = one + sep + one + sep; // 末尾再补一个分隔避免跳闪
            textEl.textContent = full;
        }
        rebuildMarquee();
        // 动态添加接口 (bar)
        window.__announceAdd = function (m, opts) {
            if (!m) return;
            if (opts && opts.priority === 'front') msgs.unshift(m); else msgs.push(m);
            rebuildMarquee();
            // 重新计算动画参数
            initAnim();
        };
    }
    box.hidden = false;

    function initAnim() {
        if (styleMode === 'card') return; // 卡片不跑长滚动画
        requestAnimationFrame(() => {
            const w = textEl.scrollWidth / 2; // 单循环宽度 (近似)
            const dur = w / speed;
            textEl.style.setProperty('--ann-distance', w + 'px');
            textEl.style.setProperty('--ann-duration', dur + 's');
            textEl.classList.add('animate');
        });
    }

    // 交互：悬停暂停 / 按住加速
    let paused = false;
    function setState() {
        textEl.classList.toggle('paused', paused);
    }
    if (styleMode !== 'card') {
        box.addEventListener('mouseenter', () => { paused = true; setState(); });
        box.addEventListener('mouseleave', () => { paused = false; setState(); });
        box.addEventListener('mousedown', () => { textEl.classList.add('fast'); });
        window.addEventListener('mouseup', () => { textEl.classList.remove('fast'); });
        box.addEventListener('touchstart', () => { textEl.classList.add('fast'); }, { passive: true });
        box.addEventListener('touchend', () => { textEl.classList.remove('fast'); });
    }

    initAnim();

    // 卡片模式动态添加接口
    if (styleMode === 'card') {
        window.__announceAdd = function (m, opts) {
            if (!m) return;
            if (opts && opts.priority === 'front') msgs.unshift(m); else msgs.push(m);
            // 新消息自然出现在后续循环中，无需立即重排
        };
    }
})();
