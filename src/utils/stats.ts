import { Workout } from "../store/workout";
import { primaryMuscleFor } from "./exerciseLookup";

export function volumeForWorkout(w: Workout): number {
  let total = 0;
  for (const ex of w.exercises) {
    for (const s of ex.sets) {
      if (!s.done) continue;
      const vol = (s.weight ?? 0) * (s.reps ?? 0);
      total += vol;
    }
  }
  return total;
}

export function volumeByMuscle(history: Workout[], days: number): Record<string, number> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const map: Record<string, number> = {};
  for (const w of history) {
    if (w.startedAt < cutoff) continue;
    for (const ex of w.exercises) {
      const m = primaryMuscleFor(ex.name);
      for (const s of ex.sets) {
        if (!s.done) continue;
        const vol = (s.weight ?? 0) * (s.reps ?? 0);
        map[m] = (map[m] ?? 0) + vol;
      }
    }
  }
  return map;
}
