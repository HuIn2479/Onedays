// IntersectionObserver 滚动淡入
(function () {
  const rootMargin = "0px 0px -5% 0px";
  const options = { threshold: 0.1, rootMargin };
  const groups = new Set();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const box = e.target; // .reveal 容器
        if (!box.classList.contains("reveal-in")) {
          // 给子元素加 reveal-item（若未标记）
          [...box.children].forEach((ch) => {
            if (!ch.classList.contains("reveal-item"))
              ch.classList.add("reveal-item");
          });
          requestAnimationFrame(() => box.classList.add("reveal-in"));
        }
        obs.unobserve(box);
      }
    });
  }, options);

  function init() {
    document.querySelectorAll(".reveal").forEach((el) => {
      if (!groups.has(el)) {
        groups.add(el);
        obs.observe(el);
      }
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
