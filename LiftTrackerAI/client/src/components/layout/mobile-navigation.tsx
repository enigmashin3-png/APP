import { Link, useLocation } from "wouter";
import { Home, Dumbbell, Play, TrendingUp, Settings } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/plans", icon: Dumbbell, label: "Plans" },
    { path: "/workout", icon: Play, label: "Workout", hasIndicator: true },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 lg:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button className={`flex flex-col items-center p-2 relative ${
                isActive ? "text-primary-600" : "text-gray-500 hover:text-primary-600"
              }`}>
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.hasIndicator && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-600 rounded-full animate-pulse"></div>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
