import { NavLink } from "react-router-dom";
import { Brand } from "./Brand";

const items = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/workouts", label: "Workouts" },
  { to: "/templates", label: "Templates" },
  { to: "/exercises", label: "Exercises" },
  { to: "/prs", label: "PRs" },
  { to: "/settings", label: "Settings" },
];

export default function SideNav() {
  return (
    <nav className="w-full">
      <div className="mb-4">
        <Brand />
      </div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.to}>
            <NavLink
              to={i.to}
              className={({ isActive }) =>
                "block rounded-lg px-3 py-2 " +
                (isActive ? "bg-neutral-100 dark:bg-neutral-800 font-medium" : "opacity-85")
              }
            >
              {i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
