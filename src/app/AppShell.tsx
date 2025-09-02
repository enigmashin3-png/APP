import React, { useMemo, useState } from "react";
import { Dumbbell, History, Settings, Plus, Search, ChevronRight, Timer, CheckCircle2, Weight, Activity, X } from "lucide-react";

// ----- Mock data (replace with real store later) -----
const MOCK_WORKOUTS = [
  { id: "w1", name: "Upper A", date: "2025-09-01", volume: 12650, durationMin: 68 },
  { id: "w2", name: "Lower A", date: "2025-08-30", volume: 10210, durationMin: 61 },
  { id: "w3", name: "Push B",  date: "2025-08-28", volume: 11800, durationMin: 64 },
  { id: "w4", name: "Pull B",  date: "2025-08-26", volume: 11190, durationMin: 59 },
];

const EXERCISES = [
  { id: "e1", name: "Bench Press", muscle: "Chest" },
  { id: "e2", name: "Incline DB Press", muscle: "Chest" },
  { id: "e3", name: "Lat Pulldown", muscle: "Back" },
  { id: "e4", name: "Seated Row", muscle: "Back" },
  { id: "e5", name: "DB Shoulder Press", muscle: "Shoulders" },
  { id: "e6", name: "EZ-Bar Curl", muscle: "Biceps" },
  { id: "e7", name: "Cable Triceps Pushdown", muscle: "Triceps" },
];

// ----- Utility -----
const formatVolume = (kg: number) => `${kg.toLocaleString()} kg`;

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
            <TopNavItem label="Dashboard" icon={<Activity className="h-4 w-4" />} active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
            <TopNavItem label="Logger" icon={<Weight className="h-4 w-4" />} active={tab === "logger"} onClick={() => setTab("logger")} />
            <TopNavItem label="History" icon={<History className="h-4 w-4" />} />
            <TopNavItem label="Settings" icon={<Settings className="h-4 w-4" />} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        {tab === "dashboard" && (
          <DashboardView onStartWorkout={(id) => { setActiveWorkoutId(id); setTab("logger"); }} />
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

function TopNavItem({ label, icon, active = false, onClick }: { label: string; icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm",
        active ? "bg-slate-900 text-white" : "hover:bg-slate-200/60 text-slate-700"
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function BottomNav({ tab, onChange }: { tab: "dashboard" | "logger"; onChange: (t: "dashboard" | "logger") => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 backdrop-blur sm:hidden">
      <div className="mx-auto max-w-5xl grid grid-cols-4">
        <BottomNavItem icon={<Activity />} label="Dashboard" active={tab === "dashboard"} onClick={() => onChange("dashboard")} />
        <BottomNavItem icon={<Weight />} label="Logger" active={tab === "logger"} onClick={() => onChange("logger")} />
        <BottomNavItem icon={<History />} label="History" />
        <BottomNavItem icon={<Settings />} label="Settings" />
      </div>
    </nav>
  );
}

function BottomNavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={[
      "flex flex-col items-center justify-center gap-1 py-3 text-xs",
      active ? "text-slate-900" : "text-slate-500"
    ].join(" ")}> 
      <div className={["h-6 w-6", active ? "opacity-100" : "opacity-70"].join(" ")}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

// ----- Dashboard View -----
function DashboardView({ onStartWorkout }: { onStartWorkout: (id: string) => void }) {
  return (
    <section className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="This Week Volume" value={formatVolume(32540)} icon={<Dumbbell className="h-5 w-5" />} />
        <KpiCard label="Best Session" value={formatVolume(13120)} icon={<CheckCircle2 className="h-5 w-5" />} />
        <KpiCard label="Avg. Duration" value="64 min" icon={<Timer className="h-5 w-5" />} />
        <KpiCard label="Streak" value="6 days" icon={<Activity className="h-5 w-5" />} />
      </div>

      {/* Recent workouts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          <button className="text-sm text-slate-600 hover:text-slate-900">View all</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {MOCK_WORKOUTS.map((w) => (
            <button key={w.id} onClick={() => onStartWorkout(w.id)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">{w.name}</p>
                  <p className="text-sm text-slate-500">{new Date(w.date).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><Dumbbell className="h-4 w-4" /> {formatVolume(w.volume)}</span>
                <span className="inline-flex items-center gap-1"><Timer className="h-4 w-4" /> {w.durationMin} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick start */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Quick Start</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            "Upper Body", "Lower Body", "Push Day", "Pull Day", "Full Body", "Arms & Shoulders"
          ].map((t, i) => (
            <button key={i} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">{t}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <div className="text-slate-500">{icon}</div>
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// ----- Logger View -----
function LoggerView({ workoutId, onExit }: { workoutId: string | null; onExit: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sets, setSets] = useState<Array<{ id: string; exId: string; weight: number; reps: number; done: boolean }>>([
    { id: "s1", exId: "e1", weight: 85, reps: 8, done: false },
    { id: "s2", exId: "e1", weight: 85, reps: 8, done: false },
  ]);

  const muscles = useMemo(() => ["All", ...Array.from(new Set(EXERCISES.map(e => e.muscle)))], []);
  const filtered = useMemo(() => EXERCISES.filter(e => (
    (filter === "All" || e.muscle === filter) && e.name.toLowerCase().includes(query.toLowerCase())
  )), [query, filter]);

  const addSet = (exId: string) => {
    const last = sets.filter(s => s.exId === exId).slice(-1)[0];
    setSets(prev => [
      ...prev,
      { id: crypto.randomUUID(), exId, weight: last?.weight ?? 20, reps: last?.reps ?? 8, done: false }
    ]);
  };

  const updateSet = (id: string, patch: Partial<{ weight: number; reps: number; done: boolean }>) => {
    setSets(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const removeSet = (id: string) => setSets(prev => prev.filter(s => s.id !== id));

  const nameOf = (exId: string) => EXERCISES.find(e => e.id === exId)?.name ?? "Exercise";

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{workoutId ? `Logging: ${workoutId}` : "Start a Workout"}</h2>
          <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs text-slate-700">Auto-save</span>
        </div>
        <button onClick={onExit} className="text-sm text-slate-600 hover:text-slate-900">Exit</button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
          />
        </label>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500">Muscle:</span>
          {muscles.map(m => (
            <button key={m} onClick={() => setFilter(m)} className={["rounded-full px-3 py-1 text-xs border", filter === m ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-700 hover:bg-slate-100"].join(" ")}>{m}</button>
          ))}
        </div>
      </div>

      {/* Exercise catalog */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map(ex => (
          <div key={ex.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{ex.name}</p>
                <p className="text-xs text-slate-500">{ex.muscle}</p>
              </div>
              <button onClick={() => addSet(ex.id)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Add Set
              </button>
            </div>

            {/* Sets for this exercise */}
            <div className="mt-3 space-y-2">
              {sets.filter(s => s.exId === ex.id).map(s => (
                <div key={s.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => updateSet(s.id, { weight: Number(e.target.value || 0) })}
                    className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                    aria-label="Weight"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => updateSet(s.id, { reps: Number(e.target.value || 0) })}
                    className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                    aria-label="Reps"
                  />
                  <span className="text-xs text-slate-500">reps</span>
                  <button
                    onClick={() => updateSet(s.id, { done: !s.done })}
                    className={["ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs",
                      s.done ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"].join(" ")}
                    aria-pressed={s.done}
                  >
                    <CheckCircle2 className="h-4 w-4" /> {s.done ? "Done" : "Mark"}
                  </button>
                  <button onClick={() => removeSet(s.id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700" aria-label="Remove set">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action (end workout) */}
      <div className="fixed inset-x-0 bottom-20 flex justify-center sm:bottom-8">
        <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">
          <CheckCircle2 className="h-5 w-5" />
          Complete Workout
        </button>
      </div>
    </section>
  );
}

export default AppShell;
