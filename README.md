# Onedays

极简纯静态主页 / 引导页模版：无构建依赖，支持 PWA、主题与 Accent 切换、开屏进度、骨架加载、一言、运行时长、滚动动画、小猫彩蛋。

## 快速开始

1. Clone 或 Fork
2. 修改 `js/config.js` 及 `image/logo/index.jpg`
3. 本地打开 `index.html`（PWA 建议开启本地服务器）

```powershell
python -m http.server 5173
```

1. 访问 <http://localhost:5173/>

## 部署

任意静态托管（Cloudflare Pages / GitHub Pages / Netlify / Vercel）。子路径部署需同步调整资源前缀与 `sw.js` 中 `ASSETS`。

## 缓存更新

改动静态资源后递增 `sw.js` 里的 `CACHE_NAME`。

## API

- [Hitokoto](https://hitokoto.cn/)

— END —
