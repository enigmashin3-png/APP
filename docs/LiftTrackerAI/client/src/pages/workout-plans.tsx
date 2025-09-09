import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, Users, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";
import type { WorkoutPlan } from "@shared/schema";
import { getLevelColor } from "@/lib/workout-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkoutPlans() {
  const { data: templatePlans, isLoading: templatesLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ["/api/workout-plans?templates=true"],
  });

  const { data: userPlans, isLoading: userPlansLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ["/api/workout-plans?userId=user-1"],
  });

  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation to start a session from a plan
  const startSessionMutation = useMutation({
    mutationFn: async (plan: WorkoutPlan) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plans</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose or create your training program
            </p>
          </div>
          <Button
            className="bg-primary-600 hover:bg-primary-700"
            onClick={() => navigate("/plans/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-8">
        {/* Template Plans */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Featured Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Professionally designed workout programs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              : templatePlans?.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6 space-y-4">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {plan.name}
                          </h3>
                          <Badge className={getLevelColor(plan.level)}>{plan.level}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {plan.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{plan.daysPerWeek} days per week</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Dumbbell className="h-4 w-4" />
                          <span>
                            {Array.isArray(plan.exercises) ? plan.exercises.length : 0} exercises
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Target className="h-4 w-4" />
                          <span>Strength & Hypertrophy</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                          Preview
                        </Button>
                        <Button
                          className="flex-1 bg-primary-600 hover:bg-primary-700"
                          onClick={() => startSessionMutation.mutate(plan)}
                        >
                          {startSessionMutation.isPending ? "Starting..." : "Start Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>

        {/* User Plans */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Plans</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Custom workout programs you have created
            </p>
          </div>

          {userPlansLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userPlans && userPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {plan.name}
                        </h3>
                        <Badge variant="secondary">Custom</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {plan.description || "Your custom workout plan"}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{plan.daysPerWeek} days per week</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Dumbbell className="h-4 w-4" />
                        <span>
                          {Array.isArray(plan.exercises) ? plan.exercises.length : 0} exercises
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/plans/${plan.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="flex-1 bg-primary-600 hover:bg-primary-700"
                        onClick={() => startSessionMutation.mutate(plan)}
                      >
                        {startSessionMutation.isPending ? "Starting..." : "Start"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No custom plans yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first custom workout plan tailored to your goals
                </p>
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
