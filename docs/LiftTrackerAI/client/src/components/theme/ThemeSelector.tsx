"use client";
import { THEMES, type ThemeId } from "@/lib/theme";
import { useThemeCtx } from "./ThemeProvider";

export default function ThemeSelector() {
  const { theme, setTheme } = useThemeCtx();

  return (
    <div className="space-y-3">
      <div className="font-semibold">App Theme</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as ThemeId)}
            className={`rounded-2xl p-4 border transition 
              ${theme===t.id ? "border-primary ring-2 ring-primary" : "border-card hover:border-primary/50"}`}
          >
            <div className="text-sm">{t.name}</div>
            <div className="mt-2 h-8 rounded-lg"
                 style={{
                   background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))"
                 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
