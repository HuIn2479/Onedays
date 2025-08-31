// 移除骨架并淡入真实内容
 (() => {
   const cfg = window.__APP_CONFIG__ || {};
   const delay = cfg.skeletonFadeDelay || 150;
   const rm = (e) => {
     if (!e) return;
     e.classList.remove("skeleton");
     [...e.children].forEach((c) => (c.style.visibility = ""));
     e.classList.add("fade-in");
   };
   document.addEventListener("DOMContentLoaded", () => {
     const rt = document.querySelector(".runtime.skeleton");
     rt && setTimeout(() => rm(rt), delay);
   });
   const h = document.getElementById("hitokoto");
   if (h) {
     let n = 0;
     const t = setInterval(() => {
       const a = document.getElementById("hitokoto_text");
       if (a && a.textContent && !/加载中/i.test(a.textContent)) {
         rm(h);
         clearInterval(t);
       }
       if (++n >= 40) clearInterval(t);
     }, 100);
   }
 })();
