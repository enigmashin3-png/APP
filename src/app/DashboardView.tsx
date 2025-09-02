import React from "react";
import { Activity, CheckCircle2, ChevronRight, Dumbbell, Timer } from "lucide-react";

const MOCK_WORKOUTS = [
  { id: "w1", name: "Upper A", date: "2025-09-01", volume: 12650, durationMin: 68 },
  { id: "w2", name: "Lower A", date: "2025-08-30", volume: 10210, durationMin: 61 },
  { id: "w3", name: "Push B", date: "2025-08-28", volume: 11800, durationMin: 64 },
  { id: "w4", name: "Pull B", date: "2025-08-26", volume: 11190, durationMin: 59 },
];

const formatVolume = (kg: number) => `${kg.toLocaleString()} kg`;

export default function DashboardView({
  onStartWorkout,
}: {
  onStartWorkout: (id: string) => void;
}) {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="This Week Volume"
          value={formatVolume(32540)}
          icon={<Dumbbell className="h-5 w-5" />}
        />
        <KpiCard
          label="Best Session"
          value={formatVolume(13120)}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard label="Avg. Duration" value="64 min" icon={<Timer className="h-5 w-5" />} />
        <KpiCard label="Streak" value="6 days" icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          <button className="text-sm text-slate-600 hover:text-slate-900">View all</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {MOCK_WORKOUTS.map((w) => (
            <button
              key={w.id}
              onClick={() => onStartWorkout(w.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">{w.name}</p>
                  <p className="text-sm text-slate-500">{new Date(w.date).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" /> {formatVolume(w.volume)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-4 w-4" /> {w.durationMin} min
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Quick Start</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            "Upper Body",
            "Lower Body",
            "Push Day",
            "Pull Day",
            "Full Body",
            "Arms & Shoulders",
          ].map((t, i) => (
            <button
              key={i}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              {t}
            </button>
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
