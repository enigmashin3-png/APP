import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workouts", label: "Workouts" },
  { to: "/templates", label: "Templates" },
  { to: "/exercises", label: "Exercises" },
  { to: "/settings", label: "Settings" },
];

export default function TabsNav() {
  return (
    <nav className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to} className="text-center">
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                "block py-3 text-sm " + (isActive ? "font-semibold" : "opacity-80")
              }
            >
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
