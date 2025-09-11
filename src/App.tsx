import React from "react";
import TopBar from "./components/TopBar";
import BottomTabs from "./components/BottomTabs";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hide brand top bar on small screens to match mobile mock */}
      <div className="hidden md:block">
        <TopBar />
      </div>
      <main>
        <AppRoutes />
      </main>
      {/* Global mobile bottom tabs */}
      <BottomTabs />
    </div>
  );
}
