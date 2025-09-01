// update-check.js: 版本检测 -> 公告注入 + 自动刷新 (含节流/静默/可见性/累计)
(function(){
    const cfg = window.__APP_CONFIG__ || {}; if(!cfg.enableUpdateCheck) return;
    const VERSION = cfg.version || 'dev';
    const KEY = 'onedays-version';
    let stored = localStorage.getItem(KEY); if(!stored){ localStorage.setItem(KEY, VERSION); stored = VERSION; }

    // 静默刷新窗口：两次自动刷新之间的最短间隔 (ms)
    const QUIET = cfg.updateQuietWindow || 300000; // 默认 5 分钟
    const lastKey = 'onedays-last-update';
    let lastUpdateTs = parseInt(localStorage.getItem(lastKey)||'0',10);

    // 累积多次版本跨度的缓存
    const gapKey = 'onedays-version-gap';
    let gapList = []; try { const raw = localStorage.getItem(gapKey); if(raw) gapList = JSON.parse(raw)||[]; } catch(_){ gapList=[]; }

    function saveGap(){ try{ localStorage.setItem(gapKey, JSON.stringify(gapList.slice(-6))); }catch(_){ } }

    function addAnn(msg, front){
        if(window.__announceAdd) window.__announceAdd(msg, front?{priority:'front'}:undefined); else {
            window.__ANN_PENDING = window.__ANN_PENDING || []; if(front) window.__ANN_PENDING.unshift(msg); else window.__ANN_PENDING.push(msg);
        }
    }

    async function fetchRemoteVersion(){
        const src = cfg.updateSource || '/js/config.js';
        try{ const res = await fetch(src + (src.includes('?')?'&':'?') + 'v=' + Date.now(), {cache:'no-store'}); if(!res.ok) return null; const txt = await res.text(); const m = txt.match(/version\s*:\s*"([^"]+)"/); return m?m[1]:null; }catch(_){ return null; }
    }
    function schedule(){ const itv = cfg.updateCheckInterval || 300000; setTimeout(check, itv); }

    function splashActive(){ const s = document.getElementById('splash'); return !!(s && !s.classList.contains('fade-out')); }

    async function check(){
        const remote = await fetchRemoteVersion();
        if(!remote) return schedule();
        if(remote !== stored){
            gapList.push(remote); saveGap();
            const now = Date.now();
            const tooSoon = (now - lastUpdateTs) < QUIET;
            const visibilityOk = !document.hidden; // 只在可见时刷新
            const delay = cfg.updateNotifyDelay || 0;
            // 如果 splash 仍显示，等其消失再执行
            function proceed(){
                if(tooSoon){
                    addAnn('[更新] 检测到新版本 '+ remote +' (静默期内延后)', true);
                    // 重设 stored 以便下次仍可比对到远端版本直到真正刷新
                    // 不覆盖 stored; 继续轮询
                    schedule();
                    return;
                }
                if(!visibilityOk){
                    // 页面隐藏：记录待刷新版本，等页面可见再触发
                    window.__PENDING_UPDATE__ = remote;
                    addAnn('[更新] 新版本 '+remote+' 已就绪，将在返回页面时应用', true);
                    schedule();
                    return;
                }
                setTimeout(()=>{
                    // 进入更新锁，阻止 idle 释放
                    window.__UPDATE_LOCK__ = true;
                    const gapInfo = gapList.length>1 ? ' (累计'+gapList.length+'次版本跨度)' : '';
                    addAnn('[更新] 发现新版本 '+ remote + gapInfo +' ，即将自动刷新…', true);
                    setTimeout(applyUpdate, 1600);
                }, delay);
            }
            if(splashActive()){
                // 轮询等待 splash 结束
                const waitSplash = ()=>{ if(!splashActive()) proceed(); else setTimeout(waitSplash, 400); };
                waitSplash();
            } else proceed();
        } else schedule();
    }

    async function applyUpdate(){
        try{ if(window.releaseMemory) window.releaseMemory(2); }catch(_){ }
        if('caches' in window){ try{ caches.keys().then(keys=>keys.forEach(k=>caches.delete(k))); }catch(_){ } }
        const url = new URL(location.href); url.searchParams.set('v', Date.now());
        localStorage.setItem(KEY, 'pending-'+Date.now());
        localStorage.setItem(lastKey, Date.now().toString());
        location.replace(url.toString());
    }
    window.applySiteUpdate = applyUpdate;

    if(stored && stored.startsWith('pending-')){
        localStorage.setItem(KEY, VERSION);
        lastUpdateTs = Date.now(); localStorage.setItem(lastKey, lastUpdateTs.toString());
        let msg = '[更新] 已更新到版本 '+ VERSION;
        if(gapList.length>1){ msg += ' (累计 '+ gapList.length +' 次版本)'; }
        addAnn(msg, true);
        gapList = []; saveGap();
        // 解除更新锁
        delete window.__UPDATE_LOCK__;
    }

    // 可见性恢复时若存在待更新版本直接执行
    document.addEventListener('visibilitychange', ()=>{
        if(!document.hidden && window.__PENDING_UPDATE__){
            const v = window.__PENDING_UPDATE__; delete window.__PENDING_UPDATE__;
            window.__UPDATE_LOCK__ = true;
            addAnn('[更新] 应用挂起的新版本 '+ v +' …', true);
            setTimeout(applyUpdate, 800);
        }
    });

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', check, {once:true}); else check();
})();