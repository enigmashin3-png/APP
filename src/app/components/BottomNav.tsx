import React from "react";
import { Activity, History, Settings, Weight } from "lucide-react";
import BottomNavItem from "./BottomNavItem";

export interface BottomNavProps {
  tab: "dashboard" | "logger";
  onChange: (t: "dashboard" | "logger") => void;
}

export default function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
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
