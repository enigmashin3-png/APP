import React, { useState } from "react";
import { Dumbbell, History, Settings, Weight, Activity } from "lucide-react";
import DashboardView from "./DashboardView";
import LoggerView from "./LoggerView";

// ----- Components -----
function AppShell() {
  const [tab, setTab] = useState<"dashboard" | "logger">("dashboard");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
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

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        {tab === "dashboard" && (
          <DashboardView
            onStartWorkout={(id) => {
              setActiveWorkoutId(id);
              setTab("logger");
            }}
          />
        )}
        {tab === "logger" && (
          <LoggerView workoutId={activeWorkoutId} onExit={() => setTab("dashboard")} />
        )}
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}

function TopNavItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm",
        active ? "bg-slate-900 text-white" : "hover:bg-slate-200/60 text-slate-700",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function BottomNav({
  tab,
  onChange,
}: {
  tab: "dashboard" | "logger";
  onChange: (t: "dashboard" | "logger") => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 backdrop-blur sm:hidden">
      <div className="mx-auto max-w-5xl grid grid-cols-4">
        <BottomNavItem
          icon={<Activity />}
          label="Dashboard"
          active={tab === "dashboard"}
          onClick={() => onChange("dashboard")}
        />
        <BottomNavItem
          icon={<Weight />}
          label="Logger"
          active={tab === "logger"}
          onClick={() => onChange("logger")}
        />
        <BottomNavItem icon={<History />} label="History" />
        <BottomNavItem icon={<Settings />} label="Settings" />
      </div>
    </nav>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center gap-1 py-3 text-xs",
        active ? "text-slate-900" : "text-slate-500",
      ].join(" ")}
    >
      <div className={["h-6 w-6", active ? "opacity-100" : "opacity-70"].join(" ")}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

export default AppShell;
