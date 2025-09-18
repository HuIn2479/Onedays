// navigation.js - 导航卡片动态生成
(function () {
    'use strict';

    const cfg = window.__APP_CONFIG__ || {};

    // 检查是否启用导航功能
    if (!cfg.enableNavigation || !cfg.navigationCards) {
        return;
    }

    /**
     * 创建导航卡片元素
     * @param {Object} cardConfig 卡片配置
     * @returns {HTMLElement} 创建的卡片元素
     */
    function createNavCard(cardConfig) {
        const { id, icon, title, description, url, target = '_self' } = cardConfig;

        // 创建主容器
        const card = document.createElement('a');
        card.className = 'nav-card';
        card.href = url || '#';
        card.target = target;
        card.setAttribute('data-nav-id', id);
        card.setAttribute('title', `导航到${title}`);

        // 创建图标
        const iconEl = document.createElement('div');
        iconEl.className = 'nav-card-icon';
        iconEl.textContent = icon;

        // 创建内容容器
        const contentEl = document.createElement('div');
        contentEl.className = 'nav-card-content';

        // 创建标题
        const titleEl = document.createElement('h3');
        titleEl.className = 'nav-card-title';
        titleEl.textContent = title;

        // 创建描述
        const descEl = document.createElement('p');
        descEl.className = 'nav-card-desc';
        descEl.textContent = description;

        // 创建箭头
        const arrowEl = document.createElement('div');
        arrowEl.className = 'nav-card-arrow';
        arrowEl.textContent = '→';

        // 组装元素
        contentEl.appendChild(titleEl);
        contentEl.appendChild(descEl);
        card.appendChild(iconEl);
        card.appendChild(contentEl);
        card.appendChild(arrowEl);

        return card;
    }

    /**
     * 初始化导航卡片
     */
    function initNavigation() {
        const container = document.getElementById('navCards');
        if (!container) {
            console.warn('[Navigation] 找不到导航卡片容器 #navCards');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 生成卡片
        const cards = cfg.navigationCards || [];
        if (cards.length === 0) {
            console.warn('[Navigation] 没有配置导航卡片');
            return;
        }

        const fragment = document.createDocumentFragment();
        cards.forEach(cardConfig => {
            try {
                const cardElement = createNavCard(cardConfig);
                fragment.appendChild(cardElement);
            } catch (error) {
                console.error('[Navigation] 创建卡片失败:', cardConfig, error);
            }
        });

        container.appendChild(fragment);
        container.hidden = false;

        console.log(`[Navigation] 成功加载 ${cards.length} 个导航卡片`);
    }

    /**
     * 添加导航卡片点击事件处理
     */
    function bindEvents() {
        document.addEventListener('click', (event) => {
            const card = event.target.closest('.nav-card');
            if (!card) return;

            const navId = card.getAttribute('data-nav-id');
            const url = card.href;

            // 触发自定义事件，允许其他脚本监听
            const navEvent = new CustomEvent('navigation:click', {
                detail: { id: navId, url, card }
            });
            document.dispatchEvent(navEvent);

            // 如果是锚点链接，可以在这里添加平滑滚动等效果
            if (url.startsWith('#')) {
                event.preventDefault();
                const targetId = url.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    /**
     * 动态更新导航卡片配置
     * @param {Array} newCards 新的卡片配置数组
     */
    function updateNavigation(newCards) {
        if (!Array.isArray(newCards)) return;

        cfg.navigationCards = newCards;
        initNavigation();
    }

    // 暴露公共API
    window.__NAVIGATION__ = {
        init: initNavigation,
        update: updateNavigation,
        create: createNavCard
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNavigation();
            bindEvents();
        });
    } else {
        initNavigation();
        bindEvents();
    }

})();
