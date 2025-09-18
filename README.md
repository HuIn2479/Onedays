# Onedays

只有静态文件：复制即可部署

## 功能

主题 & Accent 切换 · 公告 + 一言 · 自动版本检测静默刷新 · 内存释放/恢复 · 猫猫彩蛋

## 使用

1. Fork / Clone
2. 换 `image/logo/index.jpg`
3. 改 `js/config.js`
4. 启动本地预览：

```powershell
python -m http.server 5173
```

## 配置示例

```js
version: 'V1.0.0'
update: { enable: true }
idle: { enable: true }
catDriftInterval: 14000
```

改 version 会触发静默刷新

## API

```js
releaseMemory(1);
restoreFeatures();
__announceAdd({ text: '维护 23:00' });
detachMaomao();
```

## 关闭某些功能

更新：`update.enable=false`  内存释放：`idle.enable=false`  猫猫：`detachMaomao()`

## 部署

任意静态托管

## 感谢

hitokoto  
cloudflare  

## License

MIT © 2025
