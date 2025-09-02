import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "legend" | "classic";

interface SettingsState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "legend",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "ll-settings" },
  ),
);
