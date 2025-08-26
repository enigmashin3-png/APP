import { useMemo, useState } from "react";
import { useWorkoutStore } from "../store/workout";
import { useDbExercises } from "../hooks/useDbExercises";
import ExerciseInfoModal from "../components/ExerciseInfoModal";

export default function Exercises() {
  const ensure = useWorkoutStore((s) => s.ensureActive);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const favorites = useWorkoutStore((s) => s.favorites);
  const toggleFav = useWorkoutStore((s) => s.toggleFavoriteExercise);

  const { data, loading, error, fuse } = useDbExercises();

  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string>("All");
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const muscles = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((e) => set.add(e.primary));
    return ["All", ...Array.from(set).sort()];
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [];
    const base = muscle === "All" ? data : data.filter((e) => e.primary === muscle);
    if (!q.trim()) return base.slice(0, 400);
    if (fuse) return fuse.search(q).map((r) => r.item).filter((e) => muscle === "All" || e.primary === muscle);
    return base.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
  }, [data, fuse, q, muscle]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search exercises..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-80 h-11 rounded-xl px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        />
        <div className="flex gap-2 flex-wrap">
          {muscles.map((m) => (
            <button key={m} onClick={() => setMuscle(m)}
              className={`h-11 px-3 rounded-xl border ${muscle===m ? "bg-neutral-100 dark:bg-neutral-800" : "border-neutral-300 dark:border-neutral-700"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm opacity-70">Loading exercise database…</div>}
      {error && <div className="text-sm text-red-600">Failed to load DB: {error}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((e) => {
          const isFav = favorites.includes(e.name);
          return (
            <div key={e.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.name}</div>
                  <div className="text-xs opacity-70 truncate">{e.primary} • {e.equipment.join(", ") || "No equipment"}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button title="Info" onClick={() => { setSelected(e); setShow(true); }}
                    className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700">?</button>
                  <button title={isFav ? "Unfavorite" : "Favorite"} onClick={() => toggleFav(e.name)}
                    className={`h-9 w-9 rounded-lg border ${isFav ? "bg-yellow-100 dark:bg-yellow-900/30" : "border-neutral-300 dark:border-neutral-700"}`}>★</button>
                  <button
                    onClick={() => { ensure(); addExercise(e.name); }}
                    className="h-9 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black"
                  >
                    Add
                  </button>
                </div>
              </div>
              {e.description && <div className="text-xs opacity-70 line-clamp-2">{e.description}</div>}
            </div>
          );
        })}
        {list.length === 0 && !loading && <div className="opacity-70 text-sm">No matches.</div>}
      </div>

      <ExerciseInfoModal open={show} onClose={() => setShow(false)} exercise={selected} />
    </div>
  );
}
