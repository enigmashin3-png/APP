import { Workout } from "../store/workout";

/** Epley 1RM */
export function est1RM(weight?: number, reps?: number): number | undefined {
  if (!weight || !reps) return undefined;
  return +(weight * (1 + reps / 30)).toFixed(2);
}

export function exerciseHistory1RM(history: Workout[], exerciseName: string): Array<{ t: number; v: number }> {
  const out: Array<{ t: number; v: number }> = [];
  for (const w of history) {
    let bestForWorkout = 0;
    for (const ex of w.exercises) {
      if (ex.name.toLowerCase() !== exerciseName.toLowerCase()) continue;
      for (const s of ex.sets) {
        if (!s.done) continue;
        const oneRm = est1RM(s.weight, s.reps) ?? 0;
        if (oneRm > bestForWorkout) bestForWorkout = oneRm;
      }
    }
    if (bestForWorkout > 0) out.push({ t: w.startedAt, v: +bestForWorkout.toFixed(2) });
  }
  return out.sort((a, b) => a.t - b.t);
}

export function personalRecord(history: Workout[], exerciseName: string) {
  const list = exerciseHistory1RM(history, exerciseName);
  if (list.length === 0) return null;
  return list.reduce((m, x) => (x.v > m.v ? x : m), list[0]);
}

export function recentPRs(history: Workout[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  const names = new Set<string>();
  for (const w of history) w.exercises.forEach((e) => names.add(e.name));
  const arr: Array<{ name: string; pr?: { t: number; v: number } }> = [];
  for (const n of names) {
    const list = exerciseHistory1RM(history, n);
    const inWindow = list.filter((x) => x.t >= cutoff);
    if (inWindow.length === 0) continue;
    const pr = inWindow.reduce((m, x) => (x.v > m.v ? x : m), inWindow[0]);
    arr.push({ name: n, pr });
  }
  return arr.sort((a, b) => (b.pr?.v ?? 0) - (a.pr?.v ?? 0));
}

/** Best 1RM for a specific exercise *inside* one workout */
export function best1RMForWorkoutExercise(w: Workout, exerciseName: string): number {
  let best = 0;
  for (const ex of w.exercises) {
    if (ex.name.toLowerCase() !== exerciseName.toLowerCase()) continue;
    for (const s of ex.sets) {
      if (!s.done) continue;
      const one = est1RM(s.weight, s.reps) ?? 0;
      if (one > best) best = one;
    }
  }
  return +best.toFixed(2);
}

/** Latest timestamp this exercise appears in history */
export function latestTimeForExercise(history: Workout[], exerciseName: string): number | null {
  let latest: number | null = null;
  for (const w of history) {
    if (w.exercises.some((e) => e.name.toLowerCase() === exerciseName.toLowerCase())) {
      if (latest === null || w.startedAt > latest) latest = w.startedAt;
    }
  }
  return latest;
}

/** Best 1RM strictly *before* a given timestamp */
export function previousBestBefore(history: Workout[], exerciseName: string, beforeTs: number): { t: number; v: number } | null {
  const list = exerciseHistory1RM(history, exerciseName).filter((p) => p.t < beforeTs);
  if (list.length === 0) return null;
  const best = list.reduce((m, x) => (x.v > m.v ? x : m), list[0]);
  return best;
}

/** Is the *latest* occurrence for this exercise also the all-time PR? Optionally limit to last N days. */
export function isRecentPR(history: Workout[], exerciseName: string, daysWindow = 30): boolean {
  const pr = personalRecord(history, exerciseName);
  const latest = latestTimeForExercise(history, exerciseName);
  if (!pr || latest === null) return false;
  if (pr.t !== latest) return false;
  const cutoff = Date.now() - daysWindow * 86400000;
  return pr.t >= cutoff;
}

/** Compare current workout's best 1RM vs previous session before it */
export function compareVsPrevious(history: Workout[], current: Workout, exerciseName: string): {
  current: number;
  previous: number | null;
  delta: number | null;
  previousDate: number | null;
} {
  const cur = best1RMForWorkoutExercise(current, exerciseName);
  const prev = previousBestBefore(history, exerciseName, current.startedAt);
  const previous = prev?.v ?? null;
  const delta = previous !== null ? +(cur - previous).toFixed(2) : null;
  const previousDate = prev?.t ?? null;
  return { current: cur, previous, delta, previousDate };
}
