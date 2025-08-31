// 轻量随机位置调整 (不依赖 jQuery)
const rand = (a, b = a) => Math.floor(Math.random() * (b - a + 1)) + a;
const cat = () => {
  const el = document.getElementById("maomao");
  if (!el) return;
  el.style.bottom = rand(5, 80) + "vh";
};
// 鼠标离开时换位置
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("maomao");
  if (el) {
    el.addEventListener("mouseleave", cat);
  }
});
// 兼容旧内联调用
window.duoMaomao = cat;
