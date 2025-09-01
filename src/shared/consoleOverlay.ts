// Very small overlay for uncaught errors in dev to avoid blank screen confusion
if (typeof window !== "undefined") {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;bottom:8px;left:8px;z-index:99999;max-width:80vw;font:12px/1.4 system-ui;color:#fff";
  document.addEventListener(
    "error",
    (e) => show(String((e as any)?.message || "Error event")),
    true,
  );
  window.addEventListener("unhandledrejection", (e) =>
    show(String((e as any)?.reason || "Unhandled rejection")),
  );
  function show(msg: string) {
    const el = document.createElement("div");
    el.style.cssText =
      "background:#b91c1c; padding:8px 10px; margin-top:6px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.25)";
    el.textContent = msg;
    if (!container.parentElement) document.body.appendChild(container);
    container.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  }
}
