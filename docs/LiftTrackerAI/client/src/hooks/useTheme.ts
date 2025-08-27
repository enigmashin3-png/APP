"use client";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeId } from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY)) as ThemeId | null;
    const t = saved ?? DEFAULT_THEME;
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t === "default" ? "" : t);
  }, []);

  function setTheme(t: ThemeId) {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    }
    document.documentElement.setAttribute("data-theme", t === "default" ? "" : t);
  }

  return { theme, setTheme };
}
