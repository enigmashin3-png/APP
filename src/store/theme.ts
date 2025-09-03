import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "brand" | "legacy";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "brand",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "ll-theme" },
  ),
);

