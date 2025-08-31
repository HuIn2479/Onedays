// 启用时间，从全局配置读取
const START_AT = new Date(
  (window.__APP_CONFIG__ && window.__APP_CONFIG__.launchDate) ||
    "2021-02-27T00:00:00+08:00"
).getTime();
const pad = (n) => String(n).padStart(2, "0");

function renderRuntime() {
  const diff = Date.now() - START_AT;
  const d = Math.floor(diff / 86400000); // 天
  let rest = diff % 86400000;
  const h = Math.floor(rest / 3600000);
  rest %= 3600000;
  const m = Math.floor(rest / 60000);
  rest %= 60000;
  const s = Math.floor(rest / 1000);
  const t1 = document.getElementById("timeDate");
  const t2 = document.getElementById("times");
  if (t1) t1.textContent = `「悄悄运行${d}天`;
  if (t2) t2.textContent = `${pad(h)}小时${pad(m)}分${pad(s)}秒」`;
}

renderRuntime();
setInterval(renderRuntime, 1000);
