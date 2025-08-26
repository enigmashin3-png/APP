import { useWorkoutStore } from "../store/workout";
import MiniBar from "../components/MiniBar";
import { volumeByMuscle } from "../utils/stats";

export default function Dashboard() {
  const ensure = useWorkoutStore((s) => s.ensureActive);
  const active = useWorkoutStore((s) => s.activeWorkout);
  const history = useWorkoutStore((s) => s.history);

  const vol7 = volumeByMuscle(history, 7);
  const vol30 = volumeByMuscle(history, 30);
  const max7 = Math.max(0, ...Object.values(vol7));
  const max30 = Math.max(0, ...Object.values(vol30));

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

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
        <div className="text-lg font-semibold">Volume by Muscle</div>

        <div>
          <div className="text-sm opacity-70 mb-2">Last 7 days</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(vol7).map(([m, v]) => <MiniBar key={m} label={m} value={v} max={max7} />)}
            {Object.keys(vol7).length === 0 && <div className="text-sm opacity-70">No data in the last 7 days.</div>}
          </div>
        </div>

        <div>
          <div className="text-sm opacity-70 mb-2">Last 30 days</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(vol30).map(([m, v]) => <MiniBar key={m} label={m} value={v} max={max30} />)}
            {Object.keys(vol30).length === 0 && <div className="text-sm opacity-70">No data in the last 30 days.</div>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="mb-2 text-lg font-semibold">Recent Workouts</div>
        {history.length === 0 ? (
          <div className="text-sm opacity-70">No history yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.slice(0, 5).map((w) => (
              <li key={w.id}>
                <a href={`/workouts/${w.id}`} className="block rounded-xl border p-3 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/60">
                  {new Date(w.startedAt).toLocaleString()} • {w.exercises.length} exercises
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
