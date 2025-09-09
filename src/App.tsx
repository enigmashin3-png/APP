import React from "react";
import TopBar from "./components/TopBar";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}
