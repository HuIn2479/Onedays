(function () {
  const cfg = window.__APP_CONFIG__ || {};

  // 检查是否启用一言功能
  if (cfg.enableHitokoto === false) {
    const hitokoto = document.getElementById("hitokoto");
    if (hitokoto) hitokoto.remove();
    return;
  }

  // 获取翻译函数
  const t = window.__I18N__?.t || ((k) => k);

  // 配置选项（从全局配置获取，带默认值作为后备）
  const config = {
    provider: cfg.hitokotoProvider || "hitokoto",
    apis: cfg.hitokotoApis || {
      hitokoto: {
        url: "https://v1.hitokoto.cn/",
        categories: ["a", "b", "d", "h"],
        params: { encode: "json" }
      }
    },
    timeout: cfg.hitokotoTimeout || 8000,
    retries: cfg.hitokotoRetries || 2,
    cacheKey: "hitokoto-cache",
    cacheExpiry: cfg.hitokotoCacheTime || 300000,
    skeletonDelay: cfg.skeletonFadeDelay || 120,
  };

  // API适配器
  const adapters = {
    // 官方一言 API 适配器
    hitokoto: {
      buildUrl(apiConfig) {
        const params = new URLSearchParams(apiConfig.params || {});
        if (apiConfig.categories) {
          apiConfig.categories.forEach(cat => params.append('c', cat));
        }
        return apiConfig.url + (params.toString() ? '?' + params.toString() : '');
      },

      parseResponse(data) {
        if (!data.hitokoto) throw new Error('Invalid hitokoto response');
        const { hitokoto, from, from_who, uuid } = data;
        return {
          content: hitokoto + (from ? ` — 「${from_who || from}」` : ""),
          url: uuid ? `https://hitokoto.cn/?uuid=${uuid}` : null,
          source: from_who || from || '佚名'
        };
      }
    },

    // 自定义 API 适配器
    custom: {
      buildUrl(apiConfig) {
        if (!apiConfig.url) throw new Error('Custom API URL not configured');
        const params = new URLSearchParams(apiConfig.params || {});
        return apiConfig.url + (params.toString() ? '?' + params.toString() : '');
      },

      parseResponse(data) {
        // 尝试多种可能的响应格式
        let content = data.content || data.hitokoto || data.text || data.sentence;
        let source = data.author || data.from || data.from_who || data.source;
        let url = data.url || data.link;

        if (!content) throw new Error('Invalid custom API response');

        return {
          content: content + (source ? ` — 「${source}」` : ""),
          url: url || null,
          source: source || '佚名'
        };
      }
    }
  };

  const link = document.getElementById("hitokoto_text");
  const container = document.getElementById("hitokoto");

  if (!link || !container) return;

  // 显示一言容器
  container.hidden = false;

  // 获取当前API适配器
  const currentAdapter = adapters[config.provider];
  if (!currentAdapter) {
    console.error(`[Hitokoto] Unknown provider: ${config.provider}`);
    return;
  }

  const currentApiConfig = config.apis[config.provider];
  if (!currentApiConfig) {
    console.error(`[Hitokoto] API config not found for provider: ${config.provider}`);
    return;
  }

  // 缓存管理
  const cache = {
    get() {
      try {
        const cached = localStorage.getItem(config.cacheKey);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > config.cacheExpiry) {
          localStorage.removeItem(config.cacheKey);
          return null;
        }
        return data.content;
      } catch (e) {
        return null;
      }
    },
    set(content) {
      try {
        localStorage.setItem(
          config.cacheKey,
          JSON.stringify({
            content,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // 忽略存储错误
      }
    },
  };

  // 移除骨架样式的统一方法
  function removeSkeleton(delay = config.skeletonDelay) {
    if (container.classList.contains("skeleton")) {
      setTimeout(() => {
        container.classList.remove("skeleton");
      }, delay);
    }
  }

  // 设置一言内容
  function setHitokoto(content, url = null, isError = false) {
    link.textContent = content;
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("href");
      link.removeAttribute("target");
    }

    if (isError) {
      link.style.color = "var(--fg-mute, #999)";
    } else {
      link.style.color = "";
    }

    removeSkeleton();
  }

  // 获取一言内容的方法
  async function fetchHitokoto(attempt = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const apiUrl = currentAdapter.buildUrl(currentApiConfig);

      const response = await fetch(apiUrl, {
        mode: "cors",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = currentAdapter.parseResponse(data);

      // 缓存成功的结果
      cache.set(result);

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      // 如果是中止错误，说明是超时
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      // 重试逻辑
      if (attempt < config.retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 指数退避，最大5秒
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchHitokoto(attempt + 1);
      }

      throw error;
    }
  }

  // 主加载逻辑
  async function loadHitokoto() {
    try {
      // 首先尝试从缓存加载
      const cached = cache.get();
      if (cached) {
        setHitokoto(cached.content, cached.url);
        return;
      }

      // 从API获取
      const result = await fetchHitokoto();
      setHitokoto(result.content, result.url);

    } catch (error) {
      console.warn(`[Hitokoto] Failed to load from ${config.provider}:`, error.message);

      // 根据错误类型显示不同的错误信息
      let errorMessage;
      if (error.message.includes("timeout")) {
        errorMessage = t("hitokotoTimeout") || "一言加载超时";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = t("hitokotoNetwork") || "网络连接失败";
      } else {
        errorMessage = t("hitokotoError") || "获取一言失败 (离线?)";
      }

      setHitokoto(errorMessage, null, true);
    }
  }

  // 开始加载
  loadHitokoto();
})();
