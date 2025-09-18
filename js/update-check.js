(function () {
    const cfg = window.__APP_CONFIG__ || {};
    const updateCfg = cfg.update || {};
    // 兼容旧字段: enableUpdateCheck / update.enable
    const ENABLE = (updateCfg.enable !== false) && (cfg.enableUpdateCheck !== false);
    if (!ENABLE) return;

    // 获取翻译函数
    const t = window.__I18N__?.t || (k => k);

    // 基础配置 (多来源回退)
    const VERSION = cfg.version || 'dev';
    const SRC = updateCfg.source || cfg.updateSource || '/js/config.js';
    const INTERVAL = updateCfg.checkInterval || cfg.updateCheckInterval || 300000; // 5min 默认轮询
    const QUIET = updateCfg.quietWindow || cfg.updateQuietWindow || 300000;      // 静默刷新窗口
    const NOTIFY_DELAY = updateCfg.notifyDelay || cfg.updateNotifyDelay || 0;

    // localStorage key 常量
    const KEY_VERSION = 'onedays-version';           // 存储本地已知版本或 pending-* 标记
    const KEY_LAST_UPD = 'onedays-last-update';       // 最近一次真正刷新时间戳
    const KEY_GAP_LIST = 'onedays-version-gap';       // 累计版本跨度记录

    // 状态变量
    let stored = localStorage.getItem(KEY_VERSION);
    if (!stored) { localStorage.setItem(KEY_VERSION, VERSION); stored = VERSION; }
    let lastUpdateTs = parseInt(localStorage.getItem(KEY_LAST_UPD) || '0', 10) || 0;
    let gapList = []; try { const raw = localStorage.getItem(KEY_GAP_LIST); if (raw) gapList = JSON.parse(raw) || []; } catch (_) { }
    let timer = null; let inFlight = false; // 防重入

    function saveGap() { try { localStorage.setItem(KEY_GAP_LIST, JSON.stringify(gapList.slice(-6))); } catch (_) { } }

    function addAnn(text, front) {
        // 检查公告系统是否启用
        const cfg = window.__APP_CONFIG__ || {};
        if (cfg.enableAnnouncement === false) {
            console.log('[Update] 公告系统已禁用，跳过消息:', text);
            return;
        }
        
        // 为更新消息添加特殊标识
        const payload = typeof text === 'string' ? { text, isUpdate: true } : { ...text, isUpdate: true };
        if (window.__announceAdd) {
            // 更新消息总是使用最高优先级，确保显示在第一条
            window.__announceAdd(payload, { priority: 'front', updateMessage: true });
        } else {
            window.__ANN_PENDING = window.__ANN_PENDING || [];
            // 更新消息总是插入到队列最前面
            window.__ANN_PENDING.unshift(payload);
        }
    }

    function splashActive() {
        const s = document.getElementById('splash');
        return !!(s && !s.classList.contains('fade-out'));
    }

    // 解析版本 (支持多种格式)
    function parseVersion(txt) {
        // 尝试多种版本格式匹配
        const patterns = [
            // version: "1.x" / version: '1.x'
            /version\s*:\s*["']([^"']+)["']/,
            // "version": "1.x"
            /"version"\s*:\s*"([^"]+)"/,
            // const VERSION = "1.x" / let VERSION = "1.x"
            /(?:const|let|var)\s+VERSION\s*=\s*["']([^"']+)["']/,
            // VERSION: "1.x"
            /VERSION\s*:\s*["']([^"']+)["']/,
            // v1.x.x 格式
            /\bv?(\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9\-\.]+)?)\b/
        ];

        for (const pattern of patterns) {
            const match = txt.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    async function fetchRemoteVersion(attempt = 0) {
        const url = SRC + (SRC.includes('?') ? '&' : '?') + 'v=' + Date.now();
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return null;
            const txt = await res.text();
            return parseVersion(txt);
        } catch (err) {
            // 简单指数退避到 3 次
            if (attempt < 2) {
                return new Promise(r => setTimeout(() => r(fetchRemoteVersion(attempt + 1)), 400 * Math.pow(2, attempt)));
            }
            return null;
        }
    }

    function schedule() { timer = setTimeout(check, INTERVAL); }

    function shouldDeferQuiet() { return (Date.now() - lastUpdateTs) < QUIET; }

    function queueGap(v) { gapList.push(v); saveGap(); }

    function buildGapInfo() {
        return gapList.length > 1 ? ' ' + t('updateCumulative') + ' ' + gapList.length + ' ' + t('updateVersionSpan') : '';
    }

    function lockUpdate() { window.__UPDATE_LOCK__ = true; }
    function unlockUpdate() { delete window.__UPDATE_LOCK__; }

    async function applyUpdate() {
        try { window.releaseMemory && window.releaseMemory(2); } catch (_) { }
        if ('caches' in window) { try { caches.keys().then(keys => keys.forEach(k => caches.delete(k))); } catch (_) { } }
        const url = new URL(location.href); url.searchParams.set('v', Date.now());
        localStorage.setItem(KEY_VERSION, 'pending-' + Date.now());
        localStorage.setItem(KEY_LAST_UPD, Date.now().toString());
        location.replace(url.toString());
    }
    window.applySiteUpdate = applyUpdate;

    function proceedUpdate(remote) {
        if (shouldDeferQuiet()) {
            addAnn(t('updateNewVersion') + ' ' + remote + ' ' + t('updateQuietPeriod'), true);
            schedule();
            return;
        }
        if (document.hidden) {
            window.__PENDING_UPDATE__ = remote;
            addAnn(t('updateReady') + ' ' + remote + ' ' + t('updateReadySuffix'), true);
            schedule();
            return;
        }
        setTimeout(() => {
            lockUpdate();
            addAnn(t('updateFound') + ' ' + remote + buildGapInfo() + t('updateWillRefresh'), true);
            setTimeout(applyUpdate, 1500);
        }, NOTIFY_DELAY);
    }

    async function check() {
        if (inFlight) { return; }
        inFlight = true;
        const remote = await fetchRemoteVersion();
        inFlight = false;
        if (!remote) { schedule(); return; }
        if (remote !== stored) {
            queueGap(remote);
            const run = () => proceedUpdate(remote);
            if (splashActive()) {
                const wait = () => { if (!splashActive()) run(); else setTimeout(wait, 380); }; wait();
            } else run();
        } else {
            schedule();
        }
    }

    // 刷新后回写 & 公告
    if (stored && stored.startsWith('pending-')) {
        localStorage.setItem(KEY_VERSION, VERSION);
        lastUpdateTs = Date.now(); localStorage.setItem(KEY_LAST_UPD, lastUpdateTs.toString());
        let msg = t('updateComplete') + ' ' + VERSION;
        if (gapList.length > 1) msg += ' ' + t('updateCumulative') + ' ' + gapList.length + ' ' + t('updateVersions');
        addAnn(msg, true);
        gapList = []; saveGap();
        unlockUpdate();
    }

    // 页面重新可见 -> 若有挂起更新立即执行
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.__PENDING_UPDATE__) {
            const v = window.__PENDING_UPDATE__; delete window.__PENDING_UPDATE__;
            lockUpdate();
            addAnn(t('updateApplying') + ' ' + v + ' …', true);
            setTimeout(applyUpdate, 600);
        }
    });

    // 暴露手动触发
    window.checkForUpdates = () => { clearTimeout(timer); check(); };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check, { once: true }); else check();
})();