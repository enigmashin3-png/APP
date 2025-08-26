import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutStore } from "../store/workout";
import { est1RM, exerciseHistory1RM, compareVsPrevious } from "../utils/prs";
import Sparkline from "../components/Sparkline";
import { toUserUnits, unitLabel } from "../lib/units";

export default function WorkoutDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const unit = useWorkoutStore((s) => s.settings.unit);

  const w = useMemo(() => history.find((x) => x.id === id), [history, id]);

  if (!w) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="text-lg font-semibold mb-2">Workout not found</div>
        <button onClick={() => nav(-1)} className="h-10 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Workout • {new Date(w.startedAt).toLocaleString()}</div>
            {w.notes && <div className="text-sm opacity-80 mt-1">Notes: {w.notes}</div>}
          </div>
        </div>
      </div>

      {w.exercises.map((ex) => {
        const series = exerciseHistory1RM(history, ex.name);
        const cmp = compareVsPrevious(history, w, ex.name);

        return (
          <div key={ex.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div className="font-semibold">{ex.name}</div>

            {/* Compare vs last time */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 text-sm flex items-center justify-between">
              <div>
                Current best: {cmp.current ? `${toUserUnits(cmp.current, unit).toFixed(1)} ${unitLabel(unit)}` : "—"}
                {cmp.previous !== null ? (
                  <>
                    {" "}• Prev: {toUserUnits(cmp.previous!, unit).toFixed(1)} {unitLabel(unit)}
                    {" "}({cmp.delta! > 0 ? "▲" : cmp.delta! < 0 ? "▼" : "—"} {cmp.delta! > 0 ? "+" : ""}{cmp.delta !== null ? toUserUnits(cmp.delta!, unit).toFixed(1) : "0"} {unitLabel(unit)})
                    {cmp.previousDate && (
                      <span className="opacity-70"> • {new Date(cmp.previousDate).toLocaleDateString()}</span>
                    )}
                  </>
                ) : (
                  <span className="opacity-70"> • First logged session</span>
                )}
              </div>
            </div>

            {/* Sets list */}
            <div className="space-y-2">
              {ex.sets.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 h-11 border-neutral-300 dark:border-neutral-700">
                  <div className="text-sm">Set {i + 1}</div>
                  <div className="text-sm opacity-80">
                    {s.weight !== undefined ? `${toUserUnits(s.weight, unit)} ${unitLabel(unit)}` : "—"} × {s.reps ?? "—"} {s.rpe ? `• RPE ${s.rpe}` : ""}
                    {s.weight && s.reps ? (
                      <span className="ml-2 text-xs opacity-70">1RM≈ {toUserUnits(est1RM(s.weight, s.reps)!, unit)} {unitLabel(unit)}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Sparkline trend */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <div className="mb-2 text-sm opacity-80">1RM trend</div>
              <Sparkline points={series} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
