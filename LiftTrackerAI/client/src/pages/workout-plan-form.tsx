import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Exercise, WorkoutPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Type representing a row in the plan form
type PlanExerciseRow = {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
};

/**
 * Page for creating a new workout plan or editing an existing one.
 * The route can optionally include an ID parameter, e.g. `/plans/123/edit` for editing.
 */
export default function WorkoutPlanForm() {
  const [location, navigate] = useLocation();
  // Determine if we are editing by checking the route param
  const [match, params] = useRoute("/plans/:id/edit");
  const planId = match ? params?.id : undefined;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Plan fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [rows, setRows] = useState<PlanExerciseRow[]>([]);

  // Fetch all exercises for selection
  const { data: exercises } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });

  // Fetch plan if editing
  const { data: existingPlan } = useQuery<WorkoutPlan | null>({
    queryKey: ["/api/workout-plans", planId],
    enabled: Boolean(planId),
    queryFn: async () => {
      if (!planId) return null;
      const response = await apiRequest("GET", `/api/workout-plans/${planId}`);
      if (!response.ok) throw new Error("Failed to fetch plan");
      return response.json();
    },
  });

  // Populate form when existing plan is loaded
  useEffect(() => {
    if (existingPlan) {
      setName(existingPlan.name || "");
      setDescription(existingPlan.description || "");
      setLevel(existingPlan.level || "beginner");
      setDaysPerWeek(existingPlan.daysPerWeek || 3);
      // Plan exercises are stored as JSON in the plan
      const planExercises: any[] = (existingPlan.exercises as any) || [];
      setRows(
        planExercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
        }))
      );
    }
  }, [existingPlan]);

  // Mutation for saving (create or update) the plan
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        description,
        level,
        daysPerWeek,
        userId: "user-1",
        isTemplate: false,
        exercises: rows,
      } as any;
      if (planId) {
        // Update existing plan
        const response = await apiRequest("PATCH", `/api/workout-plans/${planId}`, payload);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update plan");
        }
        return response.json();
      } else {
        // Create new plan
        const response = await apiRequest("POST", `/api/workout-plans`, payload);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create plan");
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      toast({
        title: "Plan saved",
        description: planId ? "Your changes have been saved." : "New plan created!",
      });
      // Navigate back to plans list
      navigate("/plans");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Add a new exercise row
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        exerciseId: exercises && exercises.length > 0 ? exercises[0].id : "",
        sets: 3,
        reps: 8,
        weight: undefined,
        restTime: 120,
      },
    ]);
  };

  // Remove an exercise row by index
  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle change for a row field
  const updateRow = (index: number, field: keyof PlanExerciseRow, value: any) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Fetch exercise suggestions and append them to the plan
  const suggestionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/workout-suggestions?userId=user-1&limit=3`
      );
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      return response.json();
    },
    onSuccess: (suggestions: Exercise[]) => {
      // Append suggestions as new rows if they are not already included
      setRows((prev) => {
        const existingIds = prev.map((r) => r.exerciseId);
        const newRows = suggestions
          .filter((ex) => !existingIds.includes(ex.id))
          .map((ex) => ({ exerciseId: ex.id, sets: 3, reps: 8, weight: undefined, restTime: 120 }));
        if (newRows.length === 0) {
          toast({
            title: "No new suggestions",
            description: "All suggested exercises are already in your plan.",
          });
          return prev;
        }
        toast({
          title: "Suggestions added",
          description: `${newRows.length} exercise(s) added to your plan`,
        });
        return [...prev, ...newRows];
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to load suggestions",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {planId ? "Edit Plan" : "Create Plan"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {planId ? "Modify your workout program" : "Design your own workout program"}
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/plans")}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Plan Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Push Pull Legs"
              />
            </div>
            <div>
              <Label htmlFor="plan-desc">Description</Label>
              <Textarea
                id="plan-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your plan"
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="days">Days per Week</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => suggestionMutation.mutate()}
                  disabled={suggestionMutation.isPending}
                  className="w-full"
                >
                  {suggestionMutation.isPending ? "Loading..." : "Add Suggestions"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Exercises */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exercises</h2>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                Add Exercise
              </Button>
            </div>
            {rows.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No exercises added yet.</p>
            )}
            {rows.map((row, idx) => {
              const exercise = exercises?.find((ex) => ex.id === row.exerciseId);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-6 gap-3 items-end border rounded-lg p-3 mb-2 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="col-span-2">
                    <Label>Exercise</Label>
                    <Select
                      value={row.exerciseId}
                      onValueChange={(val) => updateRow(idx, "exerciseId", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises?.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {exercise?.tips && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                        Tip: {exercise.tips}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      min={1}
                      value={row.sets}
                      onChange={(e) => updateRow(idx, "sets", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      min={1}
                      value={row.reps}
                      onChange={(e) => updateRow(idx, "reps", parseInt(e.target.value) || 1)}
                    />
                  </div>
                    <div>
                      <Label>Weight (lbs)</Label>
                      <Input
                        type="number"
                        step="2.5"
                        min={0}
                        value={row.weight ?? ""}
                        onChange={(e) => updateRow(idx, "weight", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                      />
                    </div>
                  <div>
                    <Label>Rest (sec)</Label>
                    <Input
                      type="number"
                      min={30}
                      step={30}
                      value={row.restTime ?? 0}
                      onChange={(e) => updateRow(idx, "restTime", parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}