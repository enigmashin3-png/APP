import { PropsWithChildren, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";

export default function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-legend", "theme-classic");
    root.classList.add(theme === "legend" ? "theme-legend" : "theme-classic");
  }, [theme]);

  return <>{children}</>;
}
