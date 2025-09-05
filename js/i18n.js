// 国际化 (i18n) 系统
(function () {
    // 语言包定义
    const translations = {
        "zh-CN": {
            // 通用
            loading: "加载中…",
            close: "关闭",
            copy: "复制",
            copied: "已复制",
            ready: "Ready",

            // 网络状态
            networkOffline: "📡 网络已断开",
            networkOnline: "✅ 网络已恢复",

            // 彩蛋
            konamiEasterEgg: "🎮 Konami 彩蛋触发!",
            grayscaleModeOn: "🎨 灰度模式开启",
            grayscaleModeOff: "🌈 灰度模式关闭",

            // 禁用功能提示
            devToolsDisabled: "🔒 开发者工具已禁用",
            contextMenuDisabled: "🚫 右键功能已禁用",

            // 运行时间
            runtimePrefix: "「悄悄运行",
            runtimeSuffix: "天",
            runtimeHour: "小时",
            runtimeMinute: "分",
            runtimeSecond: "秒」",

            // 按钮和标签
            themeToggle: "切换主题",
            themeToggleTitle: "切换浅/深色",
            announcementClose: "关闭公告",
            splashLoading: "加载中",
            hitokotoTitle: "一言",
            hitokotoLoading: "加载中..🍀",
            hitokotoError: "获取一言失败 (离线?)",
            hitokotoTimeout: "一言加载超时",
            hitokotoNetwork: "网络连接失败",

            // 按钮文本
            copyButton: "COPY",
            closeButton: "CLOSE",

            // 加载进度
            loadingProgress: "Loading",
            loadingPercent: "%",

            // 版本更新
            updateNewVersion: "[更新] 检测到新版本",
            updateQuietPeriod: "(静默期内稍后自动刷新)",
            updateReady: "[更新] 新版本",
            updateReadySuffix: "已就绪，返回页面后应用",
            updateFound: "[更新] 发现新版本",
            updateWillRefresh: "，即将自动刷新…",
            updateComplete: "[更新] 已更新到版本",
            updateApplying: "[更新] 应用挂起的新版本",
            updateCumulative: "(累计",
            updateVersions: "次版本)",
            updateVersionSpan: "次版本跨度)",
        },

        "en-US": {
            // General
            loading: "Loading…",
            close: "Close",
            copy: "Copy",
            copied: "Copied",
            ready: "Ready",

            // Network status
            networkOffline: "📡 Network disconnected",
            networkOnline: "✅ Network restored",

            // Easter eggs
            konamiEasterEgg: "🎮 Konami Easter Egg triggered!",
            grayscaleModeOn: "🎨 Grayscale mode enabled",
            grayscaleModeOff: "🌈 Grayscale mode disabled",

            // Disabled features
            devToolsDisabled: "🔒 Developer tools disabled",
            contextMenuDisabled: "🚫 Right-click disabled",

            // Runtime
            runtimePrefix: "「Running quietly for ",
            runtimeSuffix: " days",
            runtimeHour: " hours ",
            runtimeMinute: " minutes ",
            runtimeSecond: " seconds」",

            // Buttons and labels
            themeToggle: "Toggle theme",
            themeToggleTitle: "Switch light/dark mode",
            announcementClose: "Close announcement",
            splashLoading: "Loading",
            hitokotoTitle: "Hitokoto",
            hitokotoLoading: "Loading..🍀",
            hitokotoError: "Failed to fetch Hitokoto (Offline?)",
            hitokotoTimeout: "Hitokoto loading timeout",
            hitokotoNetwork: "Network connection failed",

            // Button text
            copyButton: "COPY",
            closeButton: "CLOSE",

            // Loading progress
            loadingProgress: "Loading",
            loadingPercent: "%",

            // Version updates
            updateNewVersion: "[Update] New version detected",
            updateQuietPeriod: "(will auto-refresh after quiet period)",
            updateReady: "[Update] New version",
            updateReadySuffix: "is ready, will apply when you return",
            updateFound: "[Update] Found new version",
            updateWillRefresh: ", auto-refreshing soon…",
            updateComplete: "[Update] Updated to version",
            updateApplying: "[Update] Applying pending new version",
            updateCumulative: "(cumulative",
            updateVersions: "versions)",
            updateVersionSpan: "version spans)",
        },

        "ja-JP": {
            // 一般的
            loading: "読み込み中…",
            close: "閉じる",
            copy: "コピー",
            copied: "コピーしました",
            ready: "準備完了",

            // ネットワーク状態
            networkOffline: "📡 ネットワークが切断されました",
            networkOnline: "✅ ネットワークが復旧しました",

            // イースターエッグ
            konamiEasterEgg: "🎮 コナミコマンド発動！",
            grayscaleModeOn: "🎨 グレースケールモード有効",
            grayscaleModeOff: "🌈 グレースケールモード無効",

            // 無効化機能
            devToolsDisabled: "🔒 開発者ツールが無効です",
            contextMenuDisabled: "🚫 右クリックが無効です",

            // 実行時間
            runtimePrefix: "「静かに稼働中 ",
            runtimeSuffix: "日",
            runtimeHour: "時間",
            runtimeMinute: "分",
            runtimeSecond: "秒」",

            // ボタンとラベル
            themeToggle: "テーマ切替",
            themeToggleTitle: "ライト/ダークモード切替",
            announcementClose: "お知らせを閉じる",
            splashLoading: "読み込み中",
            hitokotoTitle: "一言",
            hitokotoLoading: "読み込み中..🍀",
            hitokotoError: "一言の取得に失敗 (オフライン?)",
            hitokotoTimeout: "一言の読み込みがタイムアウト",
            hitokotoNetwork: "ネットワーク接続に失敗",

            // ボタンテキスト
            copyButton: "コピー",
            closeButton: "閉じる",

            // 読み込み進行状況
            loadingProgress: "読み込み中",
            loadingPercent: "%",

            // バージョン更新
            updateNewVersion: "[更新] 新バージョンを検出",
            updateQuietPeriod: "(静音期間後に自動更新)",
            updateReady: "[更新] 新バージョン",
            updateReadySuffix: "の準備完了、ページに戻った際に適用",
            updateFound: "[更新] 新バージョンを発見",
            updateWillRefresh: "、まもなく自動更新…",
            updateComplete: "[更新] バージョンに更新完了",
            updateApplying: "[更新] 保留中の新バージョンを適用",
            updateCumulative: "(累計",
            updateVersions: "バージョン)",
            updateVersionSpan: "バージョン範囲)",
        },
    };

    // 默认语言和当前语言
    let currentLang = "zh-CN";
    const defaultLang = "zh-CN";

    // 检测浏览器语言
    function detectLanguage() {
        // 首先检查本地存储
        const savedLang = localStorage.getItem("preferred-language");
        if (savedLang && translations[savedLang]) {
            return savedLang;
        }

        // 检查浏览器语言
        const browserLang = navigator.language || navigator.languages?.[0];
        if (browserLang) {
            // 精确匹配
            if (translations[browserLang]) {
                return browserLang;
            }

            // 语言代码匹配（如 en-GB -> en-US）
            const langCode = browserLang.split("-")[0];
            for (const lang in translations) {
                if (lang.startsWith(langCode)) {
                    return lang;
                }
            }
        }

        return defaultLang;
    }

    // 获取翻译文本
    function t(key, fallback = key) {
        const lang = translations[currentLang] || translations[defaultLang];
        return lang[key] || translations[defaultLang][key] || fallback;
    }

    // 设置语言
    function setLanguage(lang) {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem("preferred-language", lang);

            // 触发语言变更事件
            window.dispatchEvent(
                new CustomEvent("languageChanged", {
                    detail: { language: lang, t: t },
                })
            );

            // 更新页面文本
            updatePageTexts();
        }
    }

    // 获取当前语言
    function getCurrentLanguage() {
        return currentLang;
    }

    // 获取可用语言列表
    function getAvailableLanguages() {
        return Object.keys(translations).map((lang) => ({
            code: lang,
            name: getLanguageName(lang),
        }));
    }

    // 获取语言名称
    function getLanguageName(lang) {
        const names = {
            "zh-CN": "简体中文",
            "en-US": "English",
            "ja-JP": "日本語",
        };
        return names[lang] || lang;
    }

    // 更新页面中的文本内容
    function updatePageTexts() {
        // 更新带有 data-i18n 属性的元素
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (key) {
                el.textContent = t(key);
            }
        });

        // 更新带有 data-i18n-attr 属性的元素的属性
        document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
            const attrMap = el.getAttribute("data-i18n-attr");
            if (attrMap) {
                try {
                    const attrs = JSON.parse(attrMap);
                    for (const [attr, key] of Object.entries(attrs)) {
                        el.setAttribute(attr, t(key));
                    }
                } catch (e) {
                    console.warn("Invalid i18n attribute mapping:", attrMap);
                }
            }
        });
    }

    // 初始化
    function init() {
        currentLang = detectLanguage();

        // 等待DOM加载完成后更新文本
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", updatePageTexts);
        } else {
            updatePageTexts();
        }
    }

    // 暴露API
    window.__I18N__ = {
        t,
        setLanguage,
        getCurrentLanguage,
        getAvailableLanguages,
        updatePageTexts,
        translations,
    };

    // 初始化
    init();
})();
