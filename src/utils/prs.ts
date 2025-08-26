import { Workout } from "../store/workout";

export function est1RM(weight?: number, reps?: number): number | undefined {
  if (!weight || !reps) return undefined;
  return +(weight * (1 + reps / 30)).toFixed(2); // Epley
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
