import { Outlet, useLocation } from "react-router-dom";
import TabsNav from "./components/TabsNav";
import SideNav from "./components/SideNav";
import FAB from "./components/FAB";
import BottomSheet from "./components/BottomSheet";
import FinishBar from "./components/FinishBar";
import { useState, useEffect, useMemo } from "react";
import { useWorkoutStore } from "./store/workout";
import { isTauri } from "./lib/env";
import Titlebar from "./targets/tauri/Titlebar";
import { applyTheme, bindSystemTheme } from "./lib/theme";
import { useDbExercises } from "./hooks/useDbExercises";
import ExerciseInfoModal from "./components/ExerciseInfoModal";

function ExercisePicker({ onPicked }: { onPicked: (name: string) => void }) {
  const { data, loading, error, fuse } = useDbExercises();
  const favorites = (window as any).LLfavorites ?? null; // not used; keeping inline with store would be heavier here
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!q.trim()) return data.slice(0, 80);
    if (fuse) return fuse.search(q).map((r) => r.item).slice(0, 80);
    return data.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 80);
  }, [data, fuse, q]);

  return (
    <div className="space-y-4">
      <input
        placeholder="Search exercise…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full h-11 rounded-xl px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
      />

      {loading && <div className="text-sm opacity-70">Loading exercise database…</div>}
      {error && <div className="text-sm text-red-600">Failed to load DB: {error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[45vh] overflow-auto pr-1">
        {filtered.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border p-3 border-neutral-300 dark:border-neutral-700">
            <div className="min-w-0">
              <div className="font-medium truncate">{e.name}</div>
              <div className="text-xs opacity-70 truncate">{e.primary}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                title="Info"
                onClick={() => { setSelected(e); setShow(true); }}
                className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700"
              >?</button>
              <button
                onClick={() => onPicked(e.name)}
                className="h-9 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <ExerciseInfoModal open={show} onClose={() => setShow(false)} exercise={selected} />
    </div>
  );
}
export default function App() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const hasActive = useWorkoutStore((s) => !!s.activeWorkout);
  const theme = useWorkoutStore((s) => s.settings.theme);
  const tauri = isTauri();

  useEffect(() => {
    applyTheme(theme);
    const off = bindSystemTheme(theme, () => applyTheme(theme));
    return off;
  }, [theme]);

  return (
    <>
      {tauri && <Titlebar />}
      <div className={tauri ? "pt-8 min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50" : "min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50"}>
      {/* Desktop side navigation */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-neutral-200 dark:border-neutral-800 p-4">
        <SideNav />
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-5xl px-4 py-3 font-medium capitalize">{loc.pathname.replace("/", "") || "dashboard"}</div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <Outlet />
        </main>

        {/* Mobile bottom tabs */}
        <div className="md:hidden sticky bottom-0 z-10">
          <TabsNav />
        </div>
      </div>

      {/* Global FAB to log exercises */}
      <FAB onClick={() => setOpen(true)} />

      {/* Bottom sheet for exercise picker / quick log */}
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Quick Log">
        <ExercisePicker
          onPicked={(name) => {
            useWorkoutStore.getState().ensureActive();
            useWorkoutStore.getState().addExercise(name);
            setOpen(false);
          }}
        />
      </BottomSheet>

      {/* Finish workout call-to-action */}
      {hasActive && <FinishBar />}
      </div>
    </>
  );
}
