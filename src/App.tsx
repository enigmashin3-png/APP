import { Outlet, useLocation } from "react-router-dom";
import TabsNav from "./components/TabsNav";
import SideNav from "./components/SideNav";
import FAB from "./components/FAB";
import BottomSheet from "./components/BottomSheet";
import FinishBar from "./components/FinishBar";
import { useState } from "react";
import { useWorkoutStore } from "./store/workout";

export default function App() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const hasActive = useWorkoutStore((s) => !!s.activeWorkout);

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
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
        <div className="space-y-3">
          <input
            placeholder="Search exercise..."
            className="w-full h-11 rounded-xl px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
          <div className="text-sm opacity-70">Recents</div>
          <div className="flex flex-wrap gap-2">
            {["Bench Press", "Squat", "Lat Pulldown", "DB Row", "Shoulder Press"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  useWorkoutStore.getState().ensureActive();
                  useWorkoutStore.getState().addExercise(x);
                }}
                className="rounded-full border px-3 py-1 text-sm border-neutral-300 dark:border-neutral-700"
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Finish workout call-to-action */}
      {hasActive && <FinishBar />}
    </div>
  );
}
