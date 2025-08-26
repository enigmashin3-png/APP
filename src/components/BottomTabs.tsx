import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User2, History, PlusCircle, Dumbbell, Ruler } from "lucide-react";

const items = [
  { to: "/profile",   label: "Profile",   Icon: User2 },
  { to: "/history",   label: "History",   Icon: History },
  { to: "/",          label: "Workout",   Icon: PlusCircle },
  { to: "/exercises", label: "Exercises", Icon: Dumbbell },
  { to: "/measure",   label: "Measure",   Icon: Ruler },
];

export default function BottomTabs() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-tabs">
      <div className="tabs-inner">
        {items.map(({to,label,Icon}) => {
          const active = (to === "/" ? pathname === "/" : pathname.startsWith(to));
          return (
            <Link key={to} to={to} className={`tab ${active ? "active" : ""}`}>
              <Icon className="ico" strokeWidth={2.2}/>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
