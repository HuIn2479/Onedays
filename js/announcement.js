(function () {
    const cfg = window.__APP_CONFIG__ || {};
    if (cfg.enableAnnouncement === false) return;

    const box = document.getElementById('announcement');
    if (!box) return;

    const textEl = box.querySelector('.ann-text');
    const iconEl = box.querySelector('.ann-icon');
    const closeBtn = box.querySelector('.ann-close');

    // 收集消息
    const msgs = (cfg.announcementMessages || []).filter(Boolean);
    if (Array.isArray(window.__ANN_PENDING) && window.__ANN_PENDING.length) {
        msgs.push(...window.__ANN_PENDING.splice(0));
    }
    if (!msgs.length) {
        box.remove();
        return;
    }

    // 检查是否已被关闭
    const storeKey = cfg.announcementDismissKey || 'ann-card-v1';
    if (localStorage.getItem(storeKey)) {
        window.__announceRestore = () => {
            localStorage.removeItem(storeKey);
            location.reload();
        };
        box.remove();
        return;
    }

    // 设置图标和关闭按钮
    if (iconEl) iconEl.textContent = cfg.announcementIcon || '📢';
    if (cfg.enableAnnouncementClose && closeBtn) {
        closeBtn.hidden = false;
        closeBtn.addEventListener('click', () => {
            localStorage.setItem(storeKey, '1');
            box.classList.add('ann-hide');
            setTimeout(() => box.remove(), 400);
        });
    }

    box.classList.add('announcement-card');
    box.hidden = false;

    // 单条消息处理
    if (msgs.length === 1) {
        textEl.textContent = typeof msgs[0] === 'string' ? msgs[0] : (msgs[0] && msgs[0].text) || '';
        return;
    }

    // 多条消息轮播
    const cycle = Math.max(2000, cfg.announcementCycleInterval || 4800);
    const trans = Math.min(cycle - 600, cfg.announcementTransition || 500);

    // 创建轮播结构
    const stack = document.createElement('div');
    stack.className = 'ann-stack';

    const paneA = document.createElement('span');
    paneA.className = 'ann-pane active';

    const paneB = document.createElement('span');
    paneB.className = 'ann-pane';

    stack.appendChild(paneA);
    stack.appendChild(paneB);
    textEl.replaceWith(stack);

    const panes = [paneA, paneB];
    let current = 0, next = 1, index = 0;

    const setText = (el, msg) => {
        el.textContent = typeof msg === 'string' ? msg : (msg && msg.text) || '';
    };

    setText(panes[current], msgs[index]);
    index = (index + 1) % msgs.length;

    // 设置初始高度
    requestAnimationFrame(() => {
        stack.style.height = panes[current].offsetHeight + 'px';
    });

    // 切换函数
    const flip = () => {
        const oldPane = panes[current];
        const newPane = panes[next];

        setText(newPane, msgs[index]);
        index = (index + 1) % msgs.length;

        requestAnimationFrame(() => {
            const newHeight = newPane.offsetHeight;
            stack.style.height = newHeight + 'px';

            oldPane.classList.remove('active');
            newPane.classList.add('active');

            const duration = trans + 'ms';
            oldPane.style.setProperty('--ann-trans', duration);
            newPane.style.setProperty('--ann-trans', duration);
        });

        [current, next] = [next, current];
    };

    // 启动轮播
    setInterval(flip, cycle);

    // 动态添加消息接口
    window.__announceAdd = (msg, opts) => {
        if (!msg) return;

        if (opts && opts.priority === 'front') {
            msgs.unshift(msg);
        } else {
            msgs.push(msg);
        }

        // 如果从单条变为多条，启动轮播
        if (msgs.length === 2) {
            setTimeout(flip, cycle);
        }
    };
})();
