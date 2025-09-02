import React from "react";
import { Activity, CheckCircle2, ChevronRight, Dumbbell, Timer } from "lucide-react";
import KpiCard from "./components/KpiCard";
import { MOCK_WORKOUTS, QUICK_START_TEMPLATES } from "../data/mocks";

export interface DashboardViewProps {
  onStartWorkout: (id: string) => void;
}

const formatVolume = (kg: number) => `${kg.toLocaleString()} kg`;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Unknown date" : d.toLocaleDateString();
};

export default function DashboardView({ onStartWorkout }: DashboardViewProps) {
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
                  <p className="text-sm text-slate-500">{formatDate(w.date)}</p>
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
          {QUICK_START_TEMPLATES.map((t, i) => (
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
