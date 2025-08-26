import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Templates from "./pages/Templates";
import Exercises from "./pages/Exercises";
import PRs from "./pages/PRs";
import Settings from "./pages/Settings";
import WorkoutDetail from "./pages/WorkoutDetail";
import NotFound from "./pages/NotFound";
import "./index.css";
import RootErrorBoundary from "./shared/RootErrorBoundary";

// Dev-only: lightweight error overlay (so a thrown error doesn't yield a blank page)
if (import.meta.env.DEV) {
  import("./shared/consoleOverlay").catch(() => {});
}

// Ensure we have a mount node
let rootEl = document.getElementById("root");
if (!rootEl) {
  rootEl = document.createElement("div");
  rootEl.id = "root";
  document.body.appendChild(rootEl);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workouts/:id" element={<WorkoutDetail />} />
            <Route path="templates" element={<Templates />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="prs" element={<PRs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);
