export const MUSCLE_META: Record<string, { label: string; color: string; icon: string }> = {
  Chest: { label: "Chest", color: "#ef4444", icon: "⬤" },
  Back: { label: "Back", color: "#3b82f6", icon: "⬤" },
  Shoulders: { label: "Shoulders", color: "#f59e0b", icon: "⬤" },
  Legs: { label: "Legs", color: "#22c55e", icon: "⬤" },
  Arms: { label: "Arms", color: "#a855f7", icon: "⬤" },
  Core: { label: "Core", color: "#14b8a6", icon: "⬤" },
  Other: { label: "Other", color: "#9ca3af", icon: "⬤" },
};

export function muscleMeta(name?: string) {
  if (!name) return MUSCLE_META.Other;
  return MUSCLE_META[name] ?? { ...MUSCLE_META.Other, label: name };
}
