import { useMemo, useState } from "react";
import { useWorkoutStore } from "../store/workout";
import { useDbExercises } from "../hooks/useDbExercises";
import ExerciseInfoModal from "../components/ExerciseInfoModal";
import { muscleMeta } from "../lib/muscle";
import { isRecentPR, personalRecord, latestTimeForExercise } from "../utils/prs";

export default function Exercises() {
  const ensure = useWorkoutStore((s) => s.ensureActive);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const favorites = useWorkoutStore((s) => s.favorites);
  const toggleFav = useWorkoutStore((s) => s.toggleFavoriteExercise);
  const history = useWorkoutStore((s) => s.history);

  const { data, loading, error, fuse } = useDbExercises();

  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string>("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const muscles = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((e) => set.add(e.primary));
    return ["All", ...Array.from(set).sort()];
  }, [data]);

  const tagList = useMemo(() => {
    if (!data) return [];
    const cnt = new Map<string, number>();
    for (const e of data) {
      (e.tags ?? []).forEach((t) => cnt.set(t, (cnt.get(t) ?? 0) + 1));
    }
    return Array.from(cnt.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([t]) => t);
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [];
    const base = muscle === "All" ? data : data.filter((e) => e.primary === muscle);
    const withTags =
      activeTags.length === 0
        ? base
        : base.filter((e) => {
            const set = new Set(e.tags ?? []);
            return activeTags.every((t) => set.has(t));
          });
    if (!q.trim()) return withTags.slice(0, 400);
    if (fuse)
      return fuse
        .search(q)
        .map((r) => r.item)
        .filter((e) => withTags.includes(e));
    return withTags.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
  }, [data, fuse, q, muscle, activeTags]);

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
            <button
              key={m}
              onClick={() => setMuscle(m)}
              className={`h-11 px-3 rounded-xl border ${muscle === m ? "bg-neutral-100 dark:bg-neutral-800" : "border-neutral-300 dark:border-neutral-700"}`}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: m === "All" ? "#9ca3af" : muscleMeta(m).color }}
                />
                {m}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tagList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagList.map((t) => {
            const on = activeTags.includes(t);
            return (
              <button
                key={t}
                onClick={() =>
                  setActiveTags(on ? activeTags.filter((x) => x !== t) : [...activeTags, t])
                }
                className={`h-8 px-3 rounded-full border text-sm ${on ? "bg-neutral-100 dark:bg-neutral-800" : "border-neutral-300 dark:border-neutral-700"}`}
              >
                #{t}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="h-8 px-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm"
            >
              Clear tags
            </button>
          )}
        </div>
      )}

      {loading && <div className="text-sm opacity-70">Loading exercise database…</div>}
      {error && <div className="text-sm text-red-600">Failed to load DB: {error}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((e) => {
          const isFav = favorites.includes(e.name);
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    <span className="truncate">{e.name}</span>
                    {(() => {
                      const pr = personalRecord(history, e.name);
                      const latest = latestTimeForExercise(history, e.name);
                      const recent = isRecentPR(history, e.name, 30);
                      const showBadge = !!pr && !!latest && recent && pr!.t === latest;
                      return showBadge ? (
                        <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-green-600 text-white">
                          PR
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-xs opacity-80 truncate">
                    {e.primary} • {e.equipment.join(", ") || "No equipment"}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    title="Info"
                    onClick={() => {
                      setSelected(e);
                      setShow(true);
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700"
                  >
                    ?
                  </button>
                  <button
                    title={isFav ? "Unfavorite" : "Favorite"}
                    onClick={() => toggleFav(e.name)}
                    className={`h-9 w-9 rounded-lg border ${isFav ? "bg-yellow-100 dark:bg-yellow-900/30" : "border-neutral-300 dark:border-neutral-700"}`}
                  >
                    ★
                  </button>
                  <button
                    onClick={() => {
                      ensure();
                      addExercise(e.name);
                    }}
                    className="h-9 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black"
                  >
                    Add
                  </button>
                </div>
              </div>
              {e.description && (
                <div className="text-xs opacity-70 line-clamp-2">{e.description}</div>
              )}
            </div>
          );
        })}
        {list.length === 0 && !loading && <div className="opacity-70 text-sm">No matches.</div>}
      </div>

      <ExerciseInfoModal open={show} onClose={() => setShow(false)} exercise={selected} />
    </div>
  );
}
