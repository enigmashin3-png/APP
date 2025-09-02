import React, { useState } from "react";
import { Activity, Dumbbell, History, Settings, Weight } from "lucide-react";
import TopNavItem from "./components/TopNavItem";
import BottomNav from "./components/BottomNav";
import DashboardView from "./DashboardView";
import LoggerView from "./LoggerView";
import ErrorBoundary from "./ErrorBoundary";

export default function AppShell() {
  const [tab, setTab] = useState<"dashboard" | "logger">("dashboard");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 font-semibold text-slate-800">
            <Dumbbell className="h-5 w-5" />
            <span>Lift Legends</span>
          </div>
          <nav className="ml-auto hidden sm:flex items-center gap-1">
            <TopNavItem
              label="Dashboard"
              icon={<Activity className="h-4 w-4" />}
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            />
            <TopNavItem
              label="Logger"
              icon={<Weight className="h-4 w-4" />}
              active={tab === "logger"}
              onClick={() => setTab("logger")}
            />
            <TopNavItem label="History" icon={<History className="h-4 w-4" />} />
            <TopNavItem label="Settings" icon={<Settings className="h-4 w-4" />} />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        {tab === "dashboard" && (
          <ErrorBoundary>
            <DashboardView
              onStartWorkout={(id) => {
                setActiveWorkoutId(id);
                setTab("logger");
              }}
            />
          </ErrorBoundary>
        )}
        {tab === "logger" && (
          <ErrorBoundary>
            <LoggerView workoutId={activeWorkoutId} onExit={() => setTab("dashboard")} />
          </ErrorBoundary>
        )}
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
