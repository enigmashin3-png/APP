import React from "react";
import TopBar from "./components/TopBar";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main>
        {/* existing app content */}
      </main>
    </div>
  );
}
