// 精简：阻止 F12，限制右键/选中（除输入框）
["keydown", "keyup", "keypress"].forEach((t) =>
  document.addEventListener(t, (e) => {
    if (e.key === "F12") {
      e.preventDefault();
    }
  })
);
const allow = (el) =>
  (el.tagName === "INPUT" && el.type === "text") || el.tagName === "TEXTAREA";
document.addEventListener("contextmenu", (e) => {
  if (!allow(e.target)) e.preventDefault();
});
document.addEventListener("selectstart", (e) => {
  if (!allow(e.target)) e.preventDefault();
});
