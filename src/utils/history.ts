import { Workout } from "../store/workout";

export type SetLike = { weight?: number; reps?: number; rpe?: number };

/** Scan a workout for the last completed set of a named exercise (weight+reps present). */
export function lastCompletedSetInWorkoutForName(
  workout: Workout,
  exerciseName: string,
): SetLike | null {
  const ex = workout.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
  if (!ex) return null;
  for (let i = ex.sets.length - 1; i >= 0; i--) {
    const s = ex.sets[i];
    if (s.done && typeof s.weight === "number" && typeof s.reps === "number") {
      return { weight: s.weight, reps: s.reps, rpe: s.rpe };
    }
  }
  return null;
}

/** Scan the active workout by exercise id for the last completed set. */
export function lastCompletedSetInActiveByExId(
  active: Workout | null,
  exId: string,
): SetLike | null {
  if (!active) return null;
  const ex = active.exercises.find((e) => e.id === exId);
  if (!ex) return null;
  for (let i = ex.sets.length - 1; i >= 0; i--) {
    const s = ex.sets[i];
    if (s.done && typeof s.weight === "number" && typeof s.reps === "number") {
      return { weight: s.weight, reps: s.reps, rpe: s.rpe };
    }
  }
  return null;
}

/** From history (most recent first), find last completed set of a named exercise. */
export function lastCompletedSetInHistory(
  history: Workout[],
  exerciseName: string,
): SetLike | null {
  for (const w of history) {
    const found = lastCompletedSetInWorkoutForName(w, exerciseName);
    if (found) return found;
  }
  return null;
}
