import { useMemo, useState } from "react";
import Modal from "./Modal";
import type { DbExercise } from "../data/exercisesDb";
import { useWorkoutStore } from "../store/workout";
import { format } from "date-fns";
import { est1RM } from "../utils/prs";

export default function ExerciseInfoModal({
  open,
  onClose,
  exercise,
}: {
  open: boolean;
  onClose: () => void;
  exercise?: DbExercise | null;
}) {
  if (!open || !exercise) return null;

  const history = useWorkoutStore((s) => s.history);
  const unit = useWorkoutStore((s) => s.settings.unit);
  const [tab, setTab] = useState<"about" | "records">("about");

  const { rows, pr } = useMemo(() => {
    const items: Array<{ date: number; sets: Array<{ w?: number; r?: number; one?: number }> }> = [];
    let best = 0;
    for (const w of history) {
      const ex = w.exercises.find((e) => e.name.toLowerCase() === exercise.name.toLowerCase());
      if (!ex) continue;
      const sets = (ex.sets || [])
        .filter((s) => s.done && (typeof s.reps === "number" || typeof s.weight === "number"))
        .map((s) => {
          const one = est1RM(s.weight as number | undefined, s.reps as number | undefined) || 0;
          if (one > best) best = one;
          return { w: s.weight as number | undefined, r: s.reps as number | undefined, one };
        });
      if (sets.length > 0) items.push({ date: w.startedAt, sets });
    }
    items.sort((a, b) => b.date - a.date);
    return { rows: items, pr: best };
  }, [history, exercise.name]);

  const steps = useMemo(() => {
    const text = exercise.description?.trim();
    if (!text) return [] as string[];
    if (text.includes("\n")) return text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const parts = text.split(/\.\s+/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean);
    return parts.length > 1 ? parts : [text];
  }, [exercise.description]);

  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="space-y-4">
        <div className="text-sm opacity-70">
          {exercise.primary} · {exercise.equipment.join(", ") || "No equipment"}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800">
          <button
            className={`py-2 ${tab === "about" ? "border-b-2 border-blue-500" : "opacity-70"}`}
            onClick={() => setTab("about")}
          >
            About
          </button>
          <button
            className={`py-2 ${tab === "records" ? "border-b-2 border-blue-500" : "opacity-70"}`}
            onClick={() => setTab("records")}
          >
            Records
          </button>
        </div>

        {tab === "about" && (
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold mb-1">Instructions</div>
              {steps.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-2">
                  {steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : (
                <div className="opacity-70">No instructions available.</div>
              )}
            </div>
            <div className="grid gap-2">
              <div>
                <div className="font-semibold">Body part</div>
                <div className="opacity-80">{exercise.primary || "—"}</div>
              </div>
              <div>
                <div className="font-semibold">Equipment</div>
                <div className="opacity-80">{exercise.equipment.join(", ") || "—"}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "records" && (
          <div className="space-y-3">
            {rows.length === 0 && <div className="opacity-70 text-sm">No records yet.</div>}
            {rows.map((r, idx) => (
              <div key={idx} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
                <div className="text-sm opacity-80 mb-1">{format(r.date, "PPp")}</div>
                {r.sets.map((s, i) => {
                  const text = `${typeof s.w === 'number' ? s.w : '-'} ${unit} × ${typeof s.r === 'number' ? s.r : '-'}`;
                  const isPr = s.one === pr && pr > 0;
                  return (
                    <div key={i} className="text-sm flex items-center gap-2">
                      <span>{text}</span>
                      {isPr && (
                        <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-green-600 text-white">PR</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
