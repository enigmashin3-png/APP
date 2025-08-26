import { useWorkoutStore } from "../store/workout";

export default function FinishBar() {
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const active = useWorkoutStore((s) => s.activeWorkout);

  const setCount =
    active?.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0) ?? 0;

  if (!active) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-3xl p-3">
      <button
        onClick={finishWorkout}
        className="w-full h-12 rounded-xl bg-black text-white shadow-lg dark:bg-white dark:text-black"
      >
        Finish Workout • {setCount} sets
      </button>
    </div>
  );
}
