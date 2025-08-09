import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import WorkoutPlans from "@/pages/workout-plans";
import WorkoutPlanForm from "@/pages/workout-plan-form";
import ViewWorkoutPlan from "@/pages/view-workout-plan";
import ActiveWorkout from "@/pages/active-workout";
import Progress from "@/pages/progress";
import ExerciseDatabase from "@/pages/exercise-database";
import WorkoutHistory from "@/pages/workout-history";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { SettingsProvider } from "@/contexts/settings-context";
import MobileNavigation from "@/components/layout/mobile-navigation";
import DesktopSidebar from "@/components/layout/desktop-sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/plans" component={WorkoutPlans} />
      <Route path="/plans/new" component={WorkoutPlanForm} />
      <Route path="/plans/:id/edit" component={WorkoutPlanForm} />
      <Route path="/plans/:id" component={ViewWorkoutPlan} />
      <Route path="/workout" component={ActiveWorkout} />
      <Route path="/progress" component={Progress} />
      <Route path="/exercises" component={ExerciseDatabase} />
      <Route path="/history" component={WorkoutHistory} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <DesktopSidebar />
            <div className="lg:ml-64 pb-16 lg:pb-0">
              <Router />
            </div>
            <MobileNavigation />
          </div>
          <Toaster />
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
