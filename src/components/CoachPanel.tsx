import { useMemo } from "react";
import { useWorkoutStore } from "../store/workout";
import { volumeForWorkout } from "../utils/stats";
import CopyRequestId from "./CopyRequestId";

export default function CoachPanel() {
  const active = useWorkoutStore((s) => s.activeWorkout);
  const history = useWorkoutStore((s) => s.history);
  const settings = useWorkoutStore((s) => s.settings);

  const tips = useMemo(() => {
    const out: string[] = [];
    if (!active) return out;

    // Tip 1: rest suggestion
    out.push(
      `Default rest is ${settings.defaultRestSec}s. Increase to 120–180s for heavy compounds.`,
    );

    // Tip 2: volume spike check vs 7-day avg of last 3 sessions
    const recent = history.slice(0, 3);
    const avg = recent.length
      ? recent.reduce((a, w) => a + volumeForWorkout(w), 0) / recent.length
      : 0;
    const curVol = volumeForWorkout(active);
    if (avg > 0 && curVol > avg * 1.4) {
      out.push(
        `Today's volume is trending high vs recent (${Math.round(curVol)} vs ~${Math.round(avg)}). Consider capping sets or lengthening rest.`,
      );
    }

    // Tip 3: missing data reminder
    const hasMissing = active.exercises.some((e) =>
      e.sets.some((s) => s.done && (!s.weight || !s.reps)),
    );
    if (hasMissing)
      out.push("Some completed sets are missing weight or reps — fill them for accurate stats.");

    return out;
  }, [active, history, settings]);

  if (!active) return null;

  return (
    <aside className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 md:sticky md:top-20">
      <div className="text-lg font-semibold mb-2">Coach</div>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        {tips.length === 0 ? (
          <li>All good. Keep going! 💪</li>
        ) : (
          tips.map((t, i) => <li key={i}>{t}</li>)
        )}
      </ul>
      <CopyRequestId />
    </aside>
  );
}
