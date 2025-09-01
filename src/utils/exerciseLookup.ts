import EXERCISES from "../../data/exercises.json";

type Exercise = { name: string; primary?: string; muscle?: string };

export function primaryMuscleFor(name: string): string {
  const found = (EXERCISES as Exercise[]).find((e) => e.name.toLowerCase() === name.toLowerCase());
  return found?.primary ?? found?.muscle ?? "Other";
}

export function est1RM(weight?: number, reps?: number): number | undefined {
  if (!weight || !reps) return undefined;
  // Epley: 1RM = w * (1 + r/30)
  return +(weight * (1 + reps / 30)).toFixed(1);
}
