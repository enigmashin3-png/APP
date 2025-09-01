import { useMemo, useState } from "react";
import { useWorkoutStore } from "../store/workout";
import { exerciseHistory1RM, personalRecord, recentPRs } from "../utils/prs";
import Sparkline from "../components/Sparkline";

export default function PRs() {
  const history = useWorkoutStore((s) => s.history);
  const [q, setQ] = useState("");

  const exercisesInHistory = useMemo(() => {
    const set = new Set<string>();
    history.forEach((w) => w.exercises.forEach((e) => set.add(e.name)));
    return Array.from(set).sort();
  }, [history]);

  const selected = q || exercisesInHistory[0] || "";
  const series = useMemo(
    () => (selected ? exerciseHistory1RM(history, selected) : []),
    [history, selected],
  );
  const pr = useMemo(
    () => (selected ? personalRecord(history, selected) : null),
    [history, selected],
  );
  const recent = useMemo(() => recentPRs(history, 30).slice(0, 6), [history]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="text-lg font-semibold">PR Trends</div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            list="ex-list"
            placeholder="Search exercise..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-full sm:w-80"
          />
          <datalist id="ex-list">
            {exercisesInHistory.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
          <div className="mb-2 font-medium">{selected || "No selection"}</div>
          <Sparkline points={series} />
          {pr && (
            <div className="text-sm opacity-80 mt-2">
              PR: {pr.v.toFixed(1)} (est. 1RM) on {new Date(pr.t).toLocaleDateString()}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="mb-3 text-lg font-semibold">Recent PR highlights (30d)</div>
        {recent.length === 0 ? (
          <div className="text-sm opacity-70">No PRs in the last 30 days.</div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {recent.map((r, i) => (
              <li
                key={i}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3"
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-sm opacity-80">
                  {r.pr?.v.toFixed(1)} on {r.pr ? new Date(r.pr.t).toLocaleDateString() : "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
