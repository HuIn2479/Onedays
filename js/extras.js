// 额外动画 & 特性
(function () {
    const cfg = window.__APP_CONFIG__ || {};
    // 统一注册清理函数，便于后续释放内存 (非关键特效)
    let cleanups = [];
    const root = document.documentElement;
    const body = document.body;
    const accents = cfg.accents || [];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lowPower = false;
    try {
        lowPower = matchMedia("(prefers-reduced-data: reduce)").matches;
    } catch (_) { }

    const allowGradient = cfg.enableBgGradient && !reducedMotion && !lowPower;

    // 滚动进度条
    if (cfg.enableScrollProgress) {
        const bar = document.createElement("div");
        bar.className = "scroll-progress";
        document.body.appendChild(bar);
        let ticking = false;
        const calc = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            bar.style.width = (max ? (h.scrollTop / max) * 100 : 0) + "%";
            ticking = false;
        };
        const onScroll = () => {
            if (document.hidden) return;
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(calc);
            }
        };
        ["scroll", "resize"].forEach((ev) =>
            window.addEventListener(ev, onScroll, { passive: true })
        );
        const vis = () => { if (!document.hidden) calc(); };
        document.addEventListener("visibilitychange", vis);
        calc();
        cleanups.push(() => {
            ["scroll", "resize"].forEach((ev) => window.removeEventListener(ev, onScroll));
            document.removeEventListener("visibilitychange", vis);
            bar.remove();
        });
    }

    // 背景渐变
    if (allowGradient) {
        body.classList.add("gradient-active");
        body.style.setProperty(
            "--grad-speed",
            (cfg.gradientAnimationSpeed || 40) + "s"
        );
    }

    // Accent 面板
    const themeBtn = document.getElementById("themeToggle");
    if (cfg.enableAccentPanel && themeBtn && accents.length > 1) {
        let pressTimer = null,
            panel = null;
        const showPanel = () => {
            if (panel) return;
            panel = document.createElement("div");
            panel.className = "accent-panel";
            accents.forEach((c, i) => {
                const b = document.createElement("button");
                b.className = "accent-dot";
                b.style.background = c;
                b.title = c;
                b.addEventListener("click", () => {
                    try {
                        root.style.setProperty("--accent", c);
                        localStorage.setItem("onedays-accent", i);
                        document
                            .querySelectorAll(".accent-dot")
                            .forEach((d) => d.classList.remove("active"));
                        b.classList.add("active");
                    } catch (e) { }
                });
                if (getComputedStyle(root).getPropertyValue("--accent").trim() === c)
                    b.classList.add("active");
                panel.appendChild(b);
            });
            document.body.appendChild(panel);
            setTimeout(() => document.addEventListener("click", outside, true), 0);
        };
        const hidePanel = () => {
            if (panel) {
                panel.remove();
                panel = null;
                document.removeEventListener("click", outside, true);
            }
        };
        const outside = (e) => {
            if (panel && !panel.contains(e.target) && e.target !== themeBtn)
                hidePanel();
        };
        const startPress = () => {
            pressTimer = setTimeout(showPanel, 500);
        };
        const clearPress = () => {
            clearTimeout(pressTimer);
        };
        themeBtn.addEventListener("mousedown", startPress);
        themeBtn.addEventListener("touchstart", startPress, { passive: true });
        ["mouseup", "mouseleave", "touchend", "touchcancel", "click"].forEach(
            (ev) => themeBtn.addEventListener(ev, clearPress)
        );
        cleanups.push(() => {
            themeBtn.removeEventListener("mousedown", startPress);
            themeBtn.removeEventListener("touchstart", startPress);
            ["mouseup", "mouseleave", "touchend", "touchcancel", "click"].forEach(
                (ev) => themeBtn.removeEventListener(ev, clearPress)
            );
            hidePanel();
        });
    }

    // 控制台欢迎 + ASCII
    try {
        const bannerStyle =
            "color:#fff;background:linear-gradient(90deg,var(--accent,#f36),#333);padding:4px 10px;border-radius:4px 0 0 4px;font-weight:600";
        const textStyle =
            "color:#fff;background:#333;padding:4px 10px;border-radius:0 4px 4px 0;font-weight:500";
        console.log(
            "%c Welcome %c " + new Date().getFullYear() + " ",
            " " + bannerStyle,
            " " + textStyle
        );
        if (cfg.enableAsciiPanel) {
            console.log(
                "\n %c喵%c  想找什么? 试试输入 %cshowAscii()%c ~\n",
                "color:#f36;font-weight:700",
                "color:#888",
                "color:#4aa;border-bottom:1px dotted #4aa",
                ""
            );
            window.showAscii = () => {
                if (document.getElementById('ascii-layer')) return;
                const ascii = '  /\\_/\\   喵~\n ( o.o )  Stay curious.\n  > ^ <   Have a nice day!';
                const box = document.createElement('div');
                box.id = 'ascii-layer';
                box.setAttribute('role', 'dialog');
                box.setAttribute('aria-label', 'ASCII 彩蛋');
                Object.assign(box.style, {
                    position: 'fixed', bottom: '18px', right: '20px', maxWidth: '280px', background: 'linear-gradient(145deg,rgba(20,20,22,.85),rgba(30,32,36,.82))', color: '#eee', padding: '12px 14px 10px', font: '12px/1.45 ui-monospace,monospace', borderRadius: '14px', zIndex: 10000, backdropFilter: 'blur(10px) saturate(1.2)', WebkitBackdropFilter: 'blur(10px) saturate(1.2)', boxShadow: '0 4px 24px -6px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.07)', overflow: 'hidden', lineHeight: '1.45', animation: 'ascii-pop .35s cubic-bezier(.4,0,.2,1)', cursor: 'default'
                });
                // 渐变描边
                box.style.border = '1px solid transparent';
                box.style.backgroundImage = 'linear-gradient(145deg,rgba(20,20,22,.88),rgba(30,32,36,.88)),linear-gradient(120deg,var(--accent,#f36),transparent 60%)';
                box.style.backgroundOrigin = 'border-box';
                box.style.backgroundClip = 'padding-box,border-box';

                const bar = document.createElement('div');
                bar.style.display = 'flex';
                bar.style.alignItems = 'center';
                bar.style.marginBottom = '6px';
                bar.style.gap = '6px';
                const title = document.createElement('span');
                title.textContent = 'ASCII';
                title.style.font = '600 11px system-ui,sans-serif';
                title.style.letterSpacing = '.12em';
                title.style.color = 'var(--accent,#f36)';
                title.style.textShadow = '0 0 6px color-mix(in srgb,var(--accent,#f36),transparent 65%)';
                title.style.flex = '1';
                const btnGroup = document.createElement('div');
                btnGroup.style.display = 'flex';
                btnGroup.style.gap = '4px';
                function smallBtn(txt, label) { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; Object.assign(b.style, { background: 'rgba(255,255,255,.06)', color: '#ddd', border: '1px solid rgba(255,255,255,.12)', font: '500 10px system-ui,sans-serif', padding: '2px 7px 3px', borderRadius: '6px', cursor: 'pointer', letterSpacing: '.05em', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'background .25s,border-color .25s,transform .25s' }); b.setAttribute('aria-label', label || txt); b.onmouseenter = () => { b.style.background = 'var(--accent,#f36)'; b.style.color = '#fff'; b.style.borderColor = 'var(--accent,#f36)'; }; b.onmouseleave = () => { b.style.background = 'rgba(255,255,255,.06)'; b.style.color = '#ddd'; b.style.borderColor = 'rgba(255,255,255,.12)'; }; b.onmousedown = () => b.style.transform = 'scale(.92)'; b.onmouseup = () => b.style.transform = ''; return b; }
                const copyBtn = smallBtn('COPY', '复制');
                copyBtn.addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText(ascii).then(() => toast('已复制')); });
                const closeBtn = smallBtn('CLOSE', '关闭');
                closeBtn.addEventListener('click', () => box.remove());
                btnGroup.append(copyBtn, closeBtn);
                bar.append(title, btnGroup);
                box.appendChild(bar);
                const pre = document.createElement('pre');
                pre.textContent = ascii;
                Object.assign(pre.style, { margin: 0, whiteSpace: 'pre', background: 'none', padding: 0 });
                box.appendChild(pre);

                // 拖动
                let drag = false, sx = 0, sy = 0, origX = 0, origY = 0; bar.style.cursor = 'move';
                const start = e => { drag = true; const p = e.touches ? e.touches[0] : e; sx = p.clientX; sy = p.clientY; const r = box.getBoundingClientRect(); origX = r.right; origY = r.bottom; document.addEventListener('mousemove', move); document.addEventListener('mouseup', end); document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', end); };
                const move = e => { if (!drag) return; const p = e.touches ? e.touches[0] : e; e.preventDefault && e.preventDefault(); const dx = p.clientX - sx; const dy = p.clientY - sy; const x = origX - dx; const y = origY - dy; box.style.right = Math.max(4, window.innerWidth - x) + 'px'; box.style.bottom = Math.max(4, window.innerHeight - y) + 'px'; };
                const end = () => { drag = false; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', end); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end); };
                bar.addEventListener('mousedown', start); bar.addEventListener('touchstart', start, { passive: true });

                // Toast 轻提示
                function toast(msg) {
                    const t = document.createElement('div');
                    t.textContent = msg; Object.assign(t.style, { position: 'fixed', left: '50%', top: '14%', transform: 'translateX(-50%)', background: 'var(--accent,#f36)', color: '#fff', padding: '6px 14px', font: '600 12px system-ui,sans-serif', borderRadius: '999px', letterSpacing: '.08em', zIndex: 10001, boxShadow: '0 4px 18px -4px rgba(0,0,0,.4)', opacity: '0', transition: 'opacity .35s' }); document.body.appendChild(t); requestAnimationFrame(() => t.style.opacity = '1'); setTimeout(() => { t.style.opacity = '0'; t.addEventListener('transitionend', () => t.remove(), { once: true }); }, 1400);
                }

                // 键盘 Esc 关闭
                const esc = (e) => { if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc); } }; document.addEventListener('keydown', esc);

                // 进入动画关键帧（若未定义）
                if (!document.getElementById('ascii-pop-style')) { const st = document.createElement('style'); st.id = 'ascii-pop-style'; st.textContent = '@keyframes ascii-pop{from{opacity:0;transform:translateY(8px) scale(.96);}to{opacity:1;transform:none;}}'; document.head.appendChild(st); }

                document.body.appendChild(box);
            };
        }
    } catch (_) { }

    // 猫咪点击彩带
    if (cfg.enableConfetti) {
        const cat = document.getElementById("maomao");
        if (cat) {
            const handler = () => spawnConfetti(36);
            cat.addEventListener("click", handler);
            function spawnConfetti(n) {
                const frag = document.createDocumentFragment();
                const rect = cat.getBoundingClientRect();
                for (let i = 0; i < n; i++) {
                    const el = document.createElement("i");
                    const size = 6 + Math.random() * 6;
                    const hue = Math.floor(Math.random() * 360);
                    Object.assign(el.style, {
                        position: "fixed",
                        left: rect.left + rect.width / 2 + "px",
                        top: rect.top + rect.height / 2 + "px",
                        width: size + "px",
                        height: size * 0.45 + "px",
                        background: `hsl(${hue} 80% 60%)`,
                        transform: `rotate(${Math.random() * 180}deg)`,
                        borderRadius: "2px",
                        pointerEvents: "none",
                        zIndex: 9999,
                        opacity: "0",
                        transition: "transform 1.2s ease,opacity 1.2s ease",
                    });
                    frag.appendChild(el);
                    requestAnimationFrame(() => {
                        const dx = (Math.random() - 0.5) * 260;
                        const dy = 200 + Math.random() * 180;
                        el.style.opacity = "1";
                        el.style.transform += ` translate(${dx}px,${dy}px)`;
                        el.style.filter = "blur(.3px)";
                        setTimeout(() => { el.style.opacity = "0"; }, 900);
                        setTimeout(() => el.remove(), 1400);
                    });
                }
                document.body.appendChild(frag);
            }
            cleanups.push(() => cat.removeEventListener("click", handler));
        }
    }

    // 恢复功能：按需重建已释放的特效
    if (!window.restoreFeatures) {
        window.restoreFeatures = function (level = 1) {
            if (!window.__MEM_RELEASED__) return; // 未释放无需恢复
            const c = window.__APP_CONFIG__ || {};
            // 重新启用背景渐变
            if (level > 1 && c.enableBgGradient) {
                body.classList.add('gradient-active');
            }
            // Scroll Progress
            if (c.enableScrollProgress && !document.querySelector('.scroll-progress')) {
                (function rebuildScroll() {
                    const bar = document.createElement('div');
                    bar.className = 'scroll-progress';
                    document.body.appendChild(bar);
                    let ticking = false;
                    const calc = () => {
                        const h = document.documentElement;
                        const max = h.scrollHeight - h.clientHeight;
                        bar.style.width = (max ? (h.scrollTop / max) * 100 : 0) + '%';
                        ticking = false;
                    };
                    const onScroll = () => { if (document.hidden) return; if (!ticking) { ticking = true; requestAnimationFrame(calc); } };
                    ['scroll','resize'].forEach(ev => window.addEventListener(ev,onScroll,{passive:true}));
                    const vis = () => { if (!document.hidden) calc(); };
                    document.addEventListener('visibilitychange', vis);
                    calc();
                    cleanups.push(() => { ['scroll','resize'].forEach(ev=>window.removeEventListener(ev,onScroll)); document.removeEventListener('visibilitychange', vis); bar.remove(); });
                })();
            }
            // Accent panel listeners
            const themeBtn = document.getElementById('themeToggle');
            if (c.enableAccentPanel && themeBtn && (c.accents||[]).length>1 && !themeBtn.dataset.accentBound) {
                themeBtn.dataset.accentBound = '1';
                let pressTimer=null, panel=null;
                const accents = c.accents || [];
                const root = document.documentElement;
                const showPanel = () => { if(panel) return; panel=document.createElement('div'); panel.className='accent-panel'; accents.forEach((col,i)=>{ const b=document.createElement('button'); b.className='accent-dot'; b.style.background=col; b.title=col; b.addEventListener('click',()=>{ try{ root.style.setProperty('--accent',col); localStorage.setItem('onedays-accent',i); document.querySelectorAll('.accent-dot').forEach(d=>d.classList.remove('active')); b.classList.add('active'); }catch(_){} }); if (getComputedStyle(root).getPropertyValue('--accent').trim()===col) b.classList.add('active'); panel.appendChild(b); }); document.body.appendChild(panel); setTimeout(()=>document.addEventListener('click', outside, true),0); };
                const hidePanel = () => { if(panel){ panel.remove(); panel=null; document.removeEventListener('click', outside, true);} };
                const outside = (e) => { if(panel && !panel.contains(e.target) && e.target!==themeBtn) hidePanel(); };
                const startPress = () => { pressTimer=setTimeout(showPanel,500); };
                const clearPress = () => { clearTimeout(pressTimer); };
                themeBtn.addEventListener('mousedown', startPress);
                themeBtn.addEventListener('touchstart', startPress, {passive:true});
                ['mouseup','mouseleave','touchend','touchcancel','click'].forEach(ev=>themeBtn.addEventListener(ev, clearPress));
                cleanups.push(()=>{ themeBtn.removeAttribute('data-accent-bound'); themeBtn.removeEventListener('mousedown', startPress); themeBtn.removeEventListener('touchstart', startPress); ['mouseup','mouseleave','touchend','touchcancel','click'].forEach(ev=>themeBtn.removeEventListener(ev, clearPress)); hidePanel(); });
            }
            // Confetti
            if (c.enableConfetti) {
                const cat = document.getElementById('maomao');
                if (cat && !cat.dataset.confettiBound) {
                    cat.dataset.confettiBound='1';
                    const handler=()=>spawnConfetti(36);
                    function spawnConfetti(n){ const frag=document.createDocumentFragment(); const rect=cat.getBoundingClientRect(); for(let i=0;i<n;i++){ const el=document.createElement('i'); const size=6+Math.random()*6; const hue=Math.floor(Math.random()*360); Object.assign(el.style,{position:'fixed',left:rect.left+rect.width/2+'px',top:rect.top+rect.height/2+'px',width:size+'px',height:size*0.45+'px',background:`hsl(${hue} 80% 60%)`,transform:`rotate(${Math.random()*180}deg)`,borderRadius:'2px',pointerEvents:'none',zIndex:9999,opacity:'0',transition:'transform 1.2s ease,opacity 1.2s ease'}); frag.appendChild(el); requestAnimationFrame(()=>{ const dx=(Math.random()-0.5)*260; const dy=200+Math.random()*180; el.style.opacity='1'; el.style.transform+=` translate(${dx}px,${dy}px)`; el.style.filter='blur(.3px)'; setTimeout(()=>{ el.style.opacity='0'; },900); setTimeout(()=>el.remove(),1400); }); } document.body.appendChild(frag);} cat.addEventListener('click', handler); cleanups.push(()=>{ cat.removeEventListener('click', handler); cat.removeAttribute('data-confetti-bound'); }); }
            }
            // 猫咪恢复
            if (window.initMaomao && !document.hidden) { try { window.initMaomao(); } catch(_){} }
            window.__MEM_RELEASED__ = 0;
            if (console && console.log) console.log('[Onedays] features restored');
        };
    }
    // 提供统一对外接口：释放非关键特效资源
    if (!window.releaseMemory) {
        window.releaseMemory = function (level = 1) {
            while (cleanups.length) { try { (cleanups.pop())(); } catch (_) { } }
            const ascii = document.getElementById('ascii-layer'); if (ascii) ascii.remove();
            if (level > 1) body.classList.remove('gradient-active');
            if (window.detachMaomao) try { window.detachMaomao(); } catch (_) { }
            window.__MEM_RELEASED__ = level; window.__MEM_RELEASED_LEVEL__ = level;
            if (console && console.log) console.log('[Onedays] memory released (level ' + level + ')');
        };
    }

    // === 空闲自动释放 ===
    (function idleManager(){
        if (!cfg.enableIdleAutoRelease) return;
        const delay = parseInt(cfg.idleReleaseDelay || 0,10) || 60000;
        const deepDelay = parseInt(cfg.idleDeepReleaseDelay || 0,10) || 0;
        const autoRestore = !!cfg.enableIdleAutoRestore;
        let lastActive = Date.now();
        let releasedLevel1 = false;
        let deepTimer = null; let checkTimer = null;
        const mark = ()=>{ lastActive = Date.now(); if(autoRestore && window.__MEM_RELEASED__){ // 用户回来了 -> 恢复
                window.restoreFeatures(window.__MEM_RELEASED_LEVEL__ || 1);
            }
        };
        const events = ['mousemove','keydown','wheel','touchstart','scroll','visibilitychange'];
        events.forEach(ev=>window.addEventListener(ev, mark, {passive:true}));
        function loop(){
            const idle = Date.now() - lastActive;
            if (!releasedLevel1 && idle > delay){
                if (!window.__UPDATE_LOCK__) { // 更新过程锁定不释放
                    window.releaseMemory(1); releasedLevel1 = true;
                    if (deepDelay>0){
                        deepTimer = setTimeout(()=>{ if(window.__MEM_RELEASED__ && (Date.now()-lastActive) > (delay+deepDelay) && !window.__UPDATE_LOCK__) window.releaseMemory(2); }, deepDelay);
                    }
                } else {
                    // 更新锁存在时延后再检查（推迟释放）
                    lastActive = Date.now();
                }
            }
            checkTimer = setTimeout(loop, Math.min(15000, delay));
        }
        loop();
        cleanups.push(()=>{ events.forEach(ev=>window.removeEventListener(ev, mark)); clearTimeout(checkTimer); clearTimeout(deepTimer); });
    })();
})();
