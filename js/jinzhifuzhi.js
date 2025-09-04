// 禁止 F12 / 右键 / 文本选择：短时间多次只提示一次（节流）
(()=>{
  const last = { f12:0, ctx:0 };
  const COOL = 2000; // 2s 内重复不再提示
  function infoToast(msg,type){
    const now = Date.now();
    if(now - last[type] < COOL) return; // 冷却中
    last[type] = now;
    if(window.createToast){
      window.createToast({
        text: msg,
        id: 'protect-'+type, // 稳定 id：存在时不重复
        variant:'neutral',
        duration: 2200
      });
    }
  }
  ["keydown","keyup","keypress"].forEach(t=>document.addEventListener(t,e=>{ if(e.key === 'F12'){ e.preventDefault(); infoToast('已禁用开发者快捷键','f12'); } }));
  const allow = el => (el.tagName === 'INPUT' && el.type === 'text') || el.tagName === 'TEXTAREA' || el.isContentEditable;
  document.addEventListener('contextmenu',e=>{ if(!allow(e.target)){ e.preventDefault(); infoToast('右键功能已禁用','ctx'); }});
  // 阻止普通文本被选中
  document.addEventListener('selectstart',e=>{ if(!allow(e.target)){ e.preventDefault(); }});
})();
