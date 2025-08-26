export type ThemePref = "system" | "light" | "dark";

function computeDark(pref: ThemePref) {
  if (pref === "light") return false;
  if (pref === "dark") return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function applyTheme(pref: ThemePref) {
  const dark = computeDark(pref);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
}

export function bindSystemTheme(pref: ThemePref, cb: () => void) {
  if (pref !== "system") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => cb();
  mq.addEventListener?.("change", handler);
  return () => mq.removeEventListener?.("change", handler);
}
