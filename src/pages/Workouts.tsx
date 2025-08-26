import { Link } from "react-router-dom";
import { useState } from "react";
import { useWorkoutStore } from "../store/workout";
import SetRow from "../components/SetRow";
import RestTimerChip from "../components/RestTimerChip";
import CoachPanel from "../components/CoachPanel";
import { useDbExercises } from "../hooks/useDbExercises";
import ExerciseInfoModal from "../components/ExerciseInfoModal";

export default function Workouts() {
  const active = useWorkoutStore((s) => s.activeWorkout);
  const addSet = useWorkoutStore((s) => s.addSet);
  const history = useWorkoutStore((s) => s.history);
  const repeat = useWorkoutStore((s) => s.repeatFromHistory);
  const { data } = useDbExercises();
  const [showInfo, setShowInfo] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {!active ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="mb-2 text-lg font-semibold">No active workout</div>
            <div className="text-sm opacity-70">Tap the + button to start logging.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {active.exercises.map((ex) => (
              <div key={ex.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{ex.name}</div>
                    <button
                      title="Exercise info"
                      onClick={() => {
                        const match = data?.find((d) => d.name.toLowerCase() === ex.name.toLowerCase());
                        setSelected(match ?? { name: ex.name, primary: "—", equipment: [], description: "No description found." });
                        setShowInfo(true);
                      }}
                      className="h-7 w-7 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm"
                    >?</button>
                  </div>
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
                  <button onClick={() => addSet(ex.id)} className="rounded-lg border px-4 h-10 border-neutral-300 dark:border-neutral-700">
                    Add set
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="mb-2 text-lg font-semibold">History</div>
          {history.length === 0 ? (
            <div className="text-sm opacity-70">No past workouts yet.</div>
          ) : (
            <ul className="space-y-2">
              {history.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded-xl border p-3 border-neutral-200 dark:border-neutral-800">
                  <Link to={`/workouts/${w.id}`} className="font-medium hover:underline">
                    {new Date(w.startedAt).toLocaleString()} • {w.exercises.length} exercises
                  </Link>
                  <button onClick={() => repeat(w.id)} className="h-9 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
                    Repeat
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="hidden md:block">
        <CoachPanel />
      </div>
      <ExerciseInfoModal open={showInfo} onClose={() => setShowInfo(false)} exercise={selected} />
    </div>
  );
}
