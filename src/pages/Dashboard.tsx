import { useWorkoutStore } from "../store/workout";

export default function Dashboard() {
  const ensure = useWorkoutStore((s) => s.ensureActive);
  const active = useWorkoutStore((s) => s.activeWorkout);
  const history = useWorkoutStore((s) => s.history);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="mb-2 text-lg font-semibold">Today</div>
        {active ? (
          <div className="text-sm opacity-80">Active workout started • {new Date(active.startedAt).toLocaleTimeString()}</div>
        ) : (
          <button onClick={ensure} className="rounded-lg bg-black text-white px-4 h-10 dark:bg-white dark:text-black">
            Start Workout
          </button>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="mb-2 text-lg font-semibold">Recent Workouts</div>
        {history.length === 0 ? (
          <div className="text-sm opacity-70">No history yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((w) => (
              <li key={w.id} className="rounded-xl border p-3 border-neutral-200 dark:border-neutral-800">
                {new Date(w.startedAt).toLocaleString()} • {w.exercises.length} exercises
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
