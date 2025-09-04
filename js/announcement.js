(function(){
    const cfg = window.__APP_CONFIG__ || {};
    if(cfg.enableAnnouncement === false) return;
    const box = document.getElementById('announcement'); if(!box) return;
    const textEl = box.querySelector('.ann-text');
    const iconEl = box.querySelector('.ann-icon');
    const closeBtn = box.querySelector('.ann-close');

    // 收集初始消息 (支持预挂载 __ANN_PENDING)
    const msgs = (cfg.announcementMessages || []).filter(Boolean);
    if(Array.isArray(window.__ANN_PENDING) && window.__ANN_PENDING.length){
        msgs.push(...window.__ANN_PENDING.splice(0));
    }
    if(!msgs.length){ box.remove(); return; }

    const storeKey = cfg.announcementDismissKey || 'ann-card-v1';
    if(localStorage.getItem(storeKey)){
        // 已被用户关闭；提供恢复函数
        window.__announceRestore = function(){
            localStorage.removeItem(storeKey);
            location.reload();
        };
        box.remove();
        return;
    }

    // 图标
    if(iconEl){ iconEl.textContent = cfg.announcementIcon || '📢'; }
    // 关闭按钮
    if(cfg.enableAnnouncementClose && closeBtn){
        closeBtn.hidden = false;
        closeBtn.addEventListener('click', ()=>{
            localStorage.setItem(storeKey,'1');
            box.classList.add('ann-hide');
            setTimeout(()=> box.remove(), 320);
        });
    }

    box.classList.add('announcement-card');
    box.hidden = false;

    // 参数
    const cycle = Math.max(1200, cfg.announcementCycleInterval || 4800);
    const trans = Math.min(cycle - 600, cfg.announcementTransition || 500);

    // 双缓冲结构
    const wrap = document.createElement('div'); wrap.className='ann-stack';
    const paneA = document.createElement('span'); paneA.className='ann-pane active';
    const paneB = document.createElement('span'); paneB.className='ann-pane';
    wrap.appendChild(paneA); wrap.appendChild(paneB);
    textEl.replaceWith(wrap);
    const panes=[paneA,paneB];
    let cur=0, next=1, index=0;
    function setPane(el,msg){ el.textContent = typeof msg === 'string'? msg : (msg && msg.text) || ''; }
    setPane(panes[cur], msgs[index]); index = (index+1) % msgs.length;
    requestAnimationFrame(()=>{ wrap.style.height = panes[cur].offsetHeight + 'px'; });

    function flip(){
        const oldPane = panes[cur];
        const newPane = panes[next];
        setPane(newPane, msgs[index]);
        index = (index+1) % msgs.length;
        // 高度平滑：预先读取新高度
        requestAnimationFrame(()=>{
            const newH = newPane.offsetHeight;
            wrap.style.height = newH + 'px';
            oldPane.classList.remove('active');
            newPane.classList.add('active');
            oldPane.style.setProperty('--ann-trans', trans+'ms');
            newPane.style.setProperty('--ann-trans', trans+'ms');
        });
    cur = next; next = cur?0:1;
    }

    // 仅在多条消息时轮播
    if(msgs.length>1){ setInterval(flip, cycle); }

    // 动态添加接口 (支持 priority:'front')
    window.__announceAdd = function (m, opts){
        if(!m) return;
        if(opts && opts.priority === 'front') msgs.unshift(m); else msgs.push(m);
        // 若当前只有 1 条并新增第 2 条，启动轮播
        if(msgs.length === 2){ setTimeout(()=>{ if(msgs.length>1) flip(); }, cycle); }
    };
})();
