import React from "react";

export interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, icon }: KpiCardProps) {
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
