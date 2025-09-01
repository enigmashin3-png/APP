import { Link, useLocation } from "wouter";
import { Home, Dumbbell, Play, TrendingUp, Database, History, Settings } from "lucide-react";

export default function DesktopSidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/plans", icon: Dumbbell, label: "Workout Plans" },
    { path: "/workout", icon: Play, label: "Active Workout", hasIndicator: true },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/exercises", icon: Database, label: "Exercise Database" },
    { path: "/history", icon: History, label: "Workout History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:w-64 lg:h-full lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 lg:flex lg:flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">FitTrack Pro</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const IconComponent = item.icon;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg font-medium relative ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.hasIndicator && (
                    <div className="w-2 h-2 bg-success-600 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40"
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Chen</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Intermediate</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
