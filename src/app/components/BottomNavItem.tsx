import React from "react";

export interface BottomNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function BottomNavItem({ icon, label, active, onClick }: BottomNavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
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
