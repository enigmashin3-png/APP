"use client";
import { createContext, useContext } from "react";
import { useTheme } from "@/hooks/useTheme";

type Ctx = ReturnType<typeof useTheme>;
const ThemeCtx = createContext<Ctx | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const ctx = useTheme();
  return <ThemeCtx.Provider value={ctx}>{children}</ThemeCtx.Provider>;
}

export function useThemeCtx() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useThemeCtx must be used within ThemeProvider");
  return ctx;
}
