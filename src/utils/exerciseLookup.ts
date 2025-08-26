import { EXERCISES } from "../data/exercises";

export function primaryMuscleFor(name: string): string {
  const found = EXERCISES.find((e) => e.name.toLowerCase() === name.toLowerCase());
  return found?.primary ?? "Other";
}

export function est1RM(weight?: number, reps?: number): number | undefined {
  if (!weight || !reps) return undefined;
  // Epley: 1RM = w * (1 + r/30)
  return +(weight * (1 + reps / 30)).toFixed(1);
}
