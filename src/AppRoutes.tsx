import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutSession from "./pages/WorkoutSession";
import WorkoutDetail from "./pages/WorkoutDetail";
import WorkoutHome from "./pages/WorkoutHome";
import History from "./pages/History";
import Exercises from "./pages/Exercises";
import PRs from "./pages/PRs";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Logger from "./pages/Logger";
import Measure from "./pages/Measure";
import NotFound from "./pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      {/* Make Workout the default landing to match the mock */}
      <Route path="/" element={<WorkoutHome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/workouts" element={<Workouts />} />
      <Route path="/workout" element={<WorkoutHome />} />
      <Route path="/workout/session" element={<WorkoutSession />} />
      <Route path="/workout/:id" element={<WorkoutDetail />} />
      <Route path="/history" element={<History />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/prs" element={<PRs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/logger" element={<Logger />} />
      <Route path="/measure" element={<Measure />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
