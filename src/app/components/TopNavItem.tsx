import React from "react";

export interface TopNavItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function TopNavItem({ label, icon, active = false, onClick }: TopNavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
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
