export const THEMES = [
  { id: "default", name: "Energy (Default)" },
  { id: "darkpro", name: "Dark Pro" },
  { id: "sunset",  name: "Sunset Glow" },
  { id: "minimal", name: "Minimal White" },
  { id: "arcade",  name: "Retro Arcade" }
] as const;

export type ThemeId = typeof THEMES[number]["id"];
export const DEFAULT_THEME: ThemeId = "default";
export const THEME_STORAGE_KEY = "liftlegends.theme";
