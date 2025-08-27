import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExerciseCombobox from "@/components/workout/exercise-combobox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { calculateProgressiveOverload } from "@/lib/progressive-overload";
import { apiRequest } from "@/lib/queryClient";
import { insertWorkoutSetSchema } from "@shared/schema";
import type { Exercise, WorkoutSet, InsertWorkoutSet } from "@shared/schema";
import { Lightbulb } from "lucide-react";

interface ExerciseLoggerProps {
  sessionId: string;
  onSetLogged?: (info: { restTime: number; previousSet?: WorkoutSet | null }) => void;
}

const MOCK_USER_ID = "user-1";

export default function ExerciseLogger({ sessionId, onSetLogged }: ExerciseLoggerProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setNumber, setSetNumber] = useState(1);
  const [restTimes, setRestTimes] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { weightUnit, formatWeight, restInterval } = useSettings();
  const queryClient = useQueryClient();

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: previousSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets", { exerciseId: selectedExerciseId, userId: MOCK_USER_ID }],
    enabled: !!selectedExerciseId,
  });

  const { data: currentSessionSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets", { sessionId }],
  });

  const logSetMutation = useMutation({
    mutationFn: async (setData: InsertWorkoutSet) => {
      const response = await apiRequest("POST", "/api/workout-sets", setData);
      return response.json();
    }
  });

  // Calculate current set number for selected exercise
  const exerciseSetCount = currentSessionSets?.filter(set => set.exerciseId === selectedExerciseId).length || 0;
  const currentSetNumber = exerciseSetCount + 1;

  // Get progressive overload suggestion
  const suggestion = selectedExerciseId && previousSets 
    ? calculateProgressiveOverload(previousSets, 8)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExerciseId || !weight || !reps) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const restTime = restTimes[selectedExerciseId] ?? restInterval;

    const setData: InsertWorkoutSet = {
      sessionId,
      exerciseId: selectedExerciseId,
      setNumber: currentSetNumber,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      restTime,
      completedAt: new Date(),
    };

    const validation = insertWorkoutSetSchema.safeParse(setData);
    if (!validation.success) {
      toast({
        title: "Invalid data",
        description: "Please check your inputs",
        variant: "destructive",
      });
      return;
    }

    const previousSet = previousSets?.find(s => s.sessionId !== sessionId) || null;

    logSetMutation.mutate(validation.data, {
      onSuccess: () => {
        toast({
          title: "Set logged successfully!",
          description: "Keep up the great work!",
        });

        // Reset form
        setWeight("");
        setReps("");
        setSetNumber(prev => prev + 1);

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["/api/workout-sets"] });

        onSetLogged?.({ restTime, previousSet });
      },
      onError: () => {
        toast({
          title: "Failed to log set",
          description: "Please try again",
          variant: "destructive",
        });
      }
    });
  };

  const applySuggestion = () => {
    if (suggestion) {
      setWeight(suggestion.weight.toString());
      setReps(suggestion.reps.toString());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exercise">Exercise</Label>
            <ExerciseCombobox
              exercises={exercises ?? []}
              value={selectedExerciseId}
              onChange={setSelectedExerciseId}
            />
          </div>

          {/* Exercise tips */}
          {selectedExerciseId && exercises && (
            (() => {
              const ex = exercises.find((e) => e.id === selectedExerciseId);
              if (ex?.tips) {
                return (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Tip: {ex.tips}
                  </div>
                );
              }
              return null;
            })()
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="weight">Weight</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="2.5"
                  placeholder="185"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">{weightUnit}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="8"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="set">Set</Label>
              <Input
                id="set"
                type="number"
                value={currentSetNumber}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>

          {selectedExerciseId && (
            <div>
              <Label htmlFor="rest">Rest Time (s)</Label>
              <Input
                id="rest"
                type="number"
                value={restTimes[selectedExerciseId] ?? restInterval}
                onChange={(e) =>
                  setRestTimes((prev) => ({
                    ...prev,
                    [selectedExerciseId]: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          )}

          {suggestion && (
            <Card className="bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary-600" />
                  <h4 className="font-medium text-primary-900 dark:text-primary-100">Progressive Overload Suggestion</h4>
                </div>
                <p className="text-sm text-primary-700 dark:text-primary-300 mb-3">
                  Try <strong>{formatWeight(suggestion.weight)}</strong> for <strong>{suggestion.reps} reps</strong>.
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mb-3">
                  {suggestion.reason}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applySuggestion}
                  className="border-primary-300 text-primary-700 hover:bg-primary-100 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-800"
                >
                  Apply Suggestion
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setWeight("");
                setReps("");
                setSelectedExerciseId("");
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              disabled={logSetMutation.isPending}
            >
              {logSetMutation.isPending ? "Logging..." : "Log Set"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
