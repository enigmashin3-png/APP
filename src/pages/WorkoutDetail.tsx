import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutStore } from "../store/workout";
import { est1RM } from "../utils/exerciseLookup";

export default function WorkoutDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const repeat = useWorkoutStore((s) => s.repeatFromHistory);

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
          <button
            onClick={() => { repeat(w.id); nav("/workouts"); }}
            className="h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Repeat
          </button>
        </div>
      </div>

      {w.exercises.map((ex) => (
        <div key={ex.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="font-semibold mb-2">{ex.name}</div>
          <div className="space-y-2">
            {ex.sets.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 h-11 border-neutral-300 dark:border-neutral-700">
                <div className="text-sm">Set {i + 1}</div>
                <div className="text-sm opacity-80">
                  {s.weight ?? "—"} × {s.reps ?? "—"} {s.rpe ? `• RPE ${s.rpe}` : ""}
                  {s.weight && s.reps ? (
                    <span className="ml-2 text-xs opacity-70">1RM≈ {est1RM(s.weight, s.reps)}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
