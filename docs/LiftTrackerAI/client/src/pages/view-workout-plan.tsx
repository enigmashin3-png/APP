import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { WorkoutPlan, Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { calculateVolume } from "@/lib/progressive-overload";

/**
 * View a workout plan with its details. Allows starting the plan to create a new workout session.
 */
export default function ViewWorkoutPlan() {
  const [match, params] = useRoute("/plans/:id");
  const [, navigate] = useLocation();
  const planId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plan, isLoading: planLoading } = useQuery<WorkoutPlan | null>({
    queryKey: ["/api/workout-plans", planId],
    enabled: Boolean(planId),
    queryFn: async () => {
      if (!planId) return null;
      const response = await apiRequest("GET", `/api/workout-plans/${planId}`);
      if (!response.ok) throw new Error("Failed to fetch plan");
      return response.json();
    },
  });

  // Fetch all exercises to display names and tips
  const { data: exercises } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });

  // Mutation to start a workout session from this plan
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error("Plan not loaded");
      const payload = {
        userId: "user-1",
        workoutPlanId: plan.id,
        name: plan.name,
        startedAt: new Date().toISOString(),
      };
      const response = await apiRequest("POST", "/api/workout-sessions", payload);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start session");
      }
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      toast({ title: "Session started", description: `Good luck with ${plan?.name}!` });
      navigate("/workout");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      });
    },
  });

  if (!plan && !planLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300">Workout plan not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {plan?.name || "Plan"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plan?.description}</p>
          </div>
          {plan && !plan.isTemplate && (
            <Button onClick={() => navigate(`/plans/${plan.id}/edit`)} variant="outline">
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {planLoading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          plan && (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex space-x-4">
                    <Badge variant="secondary">{plan.level}</Badge>
                    <Badge variant="secondary">{plan.daysPerWeek} days/week</Badge>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Exercises</h2>
                    <div className="space-y-3">
                      {(plan.exercises as any[]).map((ex, idx) => {
                        const exercise = exercises?.find((e) => e.id === ex.exerciseId);
                        return (
                          <div
                            key={idx}
                            className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                          >
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {exercise?.name || "Exercise"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Sets: {ex.sets}, Reps: {ex.reps}{" "}
                              {ex.weight ? `, Weight: ${ex.weight} lbs` : ""}
                              {ex.restTime ? `, Rest: ${ex.restTime}s` : ""}
                            </p>
                            {exercise?.tips && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                Tip: {exercise.tips}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate("/plans")}>
                  Back
                </Button>
                <Button
                  onClick={() => startSessionMutation.mutate()}
                  disabled={startSessionMutation.isPending}
                >
                  {startSessionMutation.isPending ? "Starting..." : "Start Plan"}
                </Button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
