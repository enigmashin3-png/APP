import { useWorkoutStore } from "../store/workout";
import SetRow from "../components/SetRow";
import RestTimerChip from "../components/RestTimerChip";

export default function Workouts() {
  const active = useWorkoutStore((s) => s.activeWorkout);
  const addSet = useWorkoutStore((s) => s.addSet);

  if (!active) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="mb-2 text-lg font-semibold">No active workout</div>
        <div className="text-sm opacity-70">Tap the + button to start logging.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.exercises.map((ex) => (
        <div key={ex.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">{ex.name}</div>
            {/* show rest if latest set has restEndAt */}
            {ex.sets.length > 0 && ex.sets[ex.sets.length - 1].restEndAt ? (
              <RestTimerChip endAt={ex.sets[ex.sets.length - 1].restEndAt!} />
            ) : null}
          </div>

          <div className="space-y-2">
            {ex.sets.map((s) => (
              <SetRow key={s.id} exId={ex.id} setId={s.id} />
            ))}
          </div>

          <div className="mt-3">
            <button
              onClick={() => addSet(ex.id)}
              className="rounded-lg border px-4 h-10 border-neutral-300 dark:border-neutral-700"
            >
              Add set
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
