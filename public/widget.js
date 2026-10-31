(function () {
  var script = document.currentScript;
  if (!script) return;
  var key = script.getAttribute("data-key") || "";
  var origin = script.src.replace(/\/widget\.js.*$/, "");
  var frame = document.createElement("iframe");
  frame.src = origin + "/embed?key=" + encodeURIComponent(key);
  frame.style.width = "100%";
  frame.style.height = "650px";
  frame.style.border = "none";
  frame.style.borderRadius = "16px";
  script.parentNode.insertBefore(frame, script.nextSibling);
})();
