export type SetEntry = {
  date: string;
  exerciseId: string;
  reps: number;
  weight: number;
  rpe?: number;
};
export type Tip = {
  message: string;
  tag: "progression" | "fatigue" | "volume" | "injury" | "form" | "habit";
  priority?: number;
};

type Prefs = {
  deloadTips?: boolean;
  targetWeeklySets?: Record<string, number>;
  exerciseToMuscle?: Record<string, string>;
};

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function groupByExercise(sets: SetEntry[]) {
  const m = new Map<string, SetEntry[]>();
  for (const s of sets) (m.get(s.exerciseId) ?? m.set(s.exerciseId, []).get(s.exerciseId)!).push(s);
  for (const arr of m.values()) arr.sort((a, b) => a.date.localeCompare(b.date));
  return m;
}

export function generateRuleTips(
  recentSets: SetEntry[],
  prefs: Prefs = {},
  painFlags: string[] = [],
): Tip[] {
  const tips: Tip[] = [];
  const groups = groupByExercise(recentSets);

  // Progressive overload
  for (const [exId, arr] of groups) {
    if (arr.length < 2) continue;
    const latest = arr[arr.length - 1];
    const hist = arr.slice(Math.max(0, arr.length - 4), arr.length - 1);
    const latestT = latest.weight * latest.reps;
    const histAvgT = avg(hist.map((s) => s.weight * s.reps));

    if (histAvgT && latestT < histAvgT * 0.97) {
      tips.push({
        tag: "progression",
        priority: 2,
        message: `Your last ${exId} was below recent average. Try a smaller load jump (+1–2.5 kg) or add 1–2 reps next time.`,
      });
    } else if (histAvgT && latestT > histAvgT * 1.05) {
      tips.push({
        tag: "progression",
        priority: 1,
        message: `Nice progress on ${exId}! Hold this load to cement technique before the next increase.`,
      });
    }
  }

  // Fatigue
  const high = recentSets.filter((s) => (s.rpe ?? 0) >= 9);
  if (high.length >= 2 && (prefs.deloadTips ?? true)) {
    tips.push({
      tag: "fatigue",
      priority: 0,
      message: "Multiple RPE ≥ 9 detected. Add a -5–10% back‑off set or reduce next week’s jump.",
    });
  }

  // Weekly volume (optional if mapping provided)
  if (prefs.exerciseToMuscle && prefs.targetWeeklySets) {
    const weekMs = 7 * 24 * 60 * 60 * 1000,
      now = Date.now();
    const done: Record<string, number> = {};
    for (const s of recentSets) {
      const t = new Date(s.date).getTime();
      if (now - t <= weekMs) {
        const mg = prefs.exerciseToMuscle[s.exerciseId];
        if (mg) done[mg] = (done[mg] ?? 0) + 1;
      }
    }
    for (const [mg, cnt] of Object.entries(done)) {
      const tgt = prefs.targetWeeklySets[mg];
      if (tgt && cnt > tgt + 4)
        tips.push({
          tag: "volume",
          priority: 2,
          message: `High volume for ${mg}. Consider trimming sets to avoid junk volume.`,
        });
    }
  }

  if (painFlags.includes("shoulder")) {
    tips.push({
      tag: "injury",
      priority: 0,
      message:
        "Shoulder flag noted. Prefer incline DB press, neutral‑grip presses, and rows with elbows tucked.",
    });
  }

  return tips.sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9));
}
