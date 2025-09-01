// 全局配置（分组 + 兼容旧平铺字段）
(function () {
  const config = {
    meta: {
      launchDate: "2021-02-27T00:00:00+08:00",
      title: "忆窝",
      subtitle: "One Day.",
    },
    splash: {
      enable: true,
      minDuration: 1000,
      removeIfFast: true,
      skeletonFadeDelay: 120,
    },
    theme: {
      accents: [
        "hsl(350 82% 54%)",
        "hsl(215 85% 55%)",
        "hsl(135 50% 42%)",
        "hsl(32 90% 52%)",
        "hsl(275 70% 60%)",
      ],
      defaultAccentIndex: 0,
      enableAccentPanel: true,
    },
    effects: {
      enableScrollProgress: true, // 启用滚动进度
      enableBgGradient: true, // 启用背景渐变
      gradientAnimationSpeed: 35, // 渐变动画速度
    },
    announcement: {
      enable: true,
      style: "card", // 'bar' | 'card'
      icon: "😽",
      messages: [
        "欢迎来到本站，祝你浏览愉快~",
        "平安喜樂，萬事勝意，祝你，祝我，祝我們",
        "关注塔菲喵~关注塔菲谢谢喵~",
        "愿你我都能被温柔以待",
        "这里会有什么呢？",
        "一个什么都不会的人",
        "ISTP-A | 机械键盘爱好者 | 猫奴",
      ],
      scrollSpeed: 60, // px/s (bar)
      cycleInterval: 4800, // ms (card)
      transition: 500, // ms (card)
      progress: true, // 进度条 (card)
      dismissKey: "ann-v2",
      closeButton: true,
    },
    performance: {
      adaptive: true, // 自适应关闭部分特效
    },
    easter: {
      konami: true,            // Konami 代码触发彩蛋
      titleClicks: true,       // 标题短时间连点彩蛋
      maxTitleInterval: 2000,  // 连点窗口(ms)
      titleClickThreshold: 7,  // 需要点击次数
      ascii: true,             // 隐藏 ASCII 面板
      confetti: true,          // 猫咪点击掉彩带
      catDriftInterval: 12000  // 猫咪自动漂移基础间隔 (ms)，0 关闭
    }
  };

  // 展平旧字段以兼容现有脚本
  const flat = {
    // meta
    launchDate: config.meta.launchDate,
    title: config.meta.title,
    subtitle: config.meta.subtitle,
    // splash
    enableSplash: config.splash.enable,
    splashMinDuration: config.splash.minDuration,
    removeSplashIfFast: config.splash.removeIfFast,
    skeletonFadeDelay: config.splash.skeletonFadeDelay,
    // theme
    accents: config.theme.accents,
    defaultAccentIndex: config.theme.defaultAccentIndex,
    enableAccentPanel: config.theme.enableAccentPanel,
    // effects
    enableScrollProgress: config.effects.enableScrollProgress,
    enableBgGradient: config.effects.enableBgGradient,
    gradientAnimationSpeed: config.effects.gradientAnimationSpeed,
    // announcement
    enableAnnouncement: config.announcement.enable,
    announcementStyle: config.announcement.style,
    announcementIcon: config.announcement.icon,
    announcementMessages: config.announcement.messages,
    announcementScrollSpeed: config.announcement.scrollSpeed,
    announcementCycleInterval: config.announcement.cycleInterval,
    announcementTransition: config.announcement.transition,
    enableAnnouncementProgress: config.announcement.progress,
    announcementDismissKey: config.announcement.dismissKey,
    enableAnnouncementClose: config.announcement.closeButton,
    // performance
    adaptivePerformance: config.performance.adaptive,
    // easter
    enableKonami: config.easter.konami,
    enableTitleClicks: config.easter.titleClicks,
    titleClickWindow: config.easter.maxTitleInterval,
    titleClickThreshold: config.easter.titleClickThreshold,
    enableAsciiPanel: config.easter.ascii,
    enableConfetti: config.easter.confetti,
    catDriftInterval: config.easter.catDriftInterval,
  };

  window.__APP_CONFIG__ = Object.assign({}, config, flat);
})();
