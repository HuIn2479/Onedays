// 本地获取一言
(function () {
  const API = "https://v1.hitokoto.cn/?c=a&c=b&c=d&c=h&encode=json";
  const link = document.getElementById("hitokoto_text");
  if (!link) return;
  fetch(API, { mode: "cors" })
    .then((r) => r.json())
    .then((data) => {
      const { hitokoto, from, from_who } = data;
      link.textContent = hitokoto + (from ? ` — 「${from_who || from}」` : "");
      link.href = "https://hitokoto.cn/?uuid=" + data.uuid;
      link.target = "_blank";
    })
    .catch(() => {
      link.textContent = "获取一言失败 (离线?)";
    });
})();
