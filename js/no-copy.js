(() => {
  const last = { f12: 0, ctx: 0 };
  const COOL = 3000; // 3s 内重复不再提示

  function showToast(msg, type) {
    const now = Date.now();
    if (now - last[type] < COOL) return; // 冷却中
    last[type] = now;

    if (window.createToast) {
      const t = window.__I18N__?.t || (k => k);
      const message = type === 'f12' ? t('devToolsDisabled') : t('contextMenuDisabled');
      window.createToast({
        text: message,
        id: 'protect-' + type,
        variant: 'neutral',
        duration: 2500
      });
    }
  }

  // 禁用 F12 开发者工具
  ['keydown', 'keyup', 'keypress'].forEach(t =>
    document.addEventListener(t, e => {
      if (e.key === 'F12') {
        e.preventDefault();
        showToast('', 'f12');
      }
    })
  );

  // 允许的可选择元素
  const isSelectAllowed = el =>
    (el.tagName === 'INPUT' && el.type === 'text') ||
    el.tagName === 'TEXTAREA' ||
    el.isContentEditable;

  // 禁用右键菜单
  document.addEventListener('contextmenu', e => {
    if (!isSelectAllowed(e.target)) {
      e.preventDefault();
      showToast('', 'ctx');
    }
  });

  // 禁止普通文本选择
  document.addEventListener('selectstart', e => {
    if (!isSelectAllowed(e.target)) {
      e.preventDefault();
      showToast('', 'sel');
    }
  });
})();
