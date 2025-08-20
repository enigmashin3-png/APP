import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ExerciseLogger from "@/components/workout/exercise-logger";
import Timer from "@/components/workout/timer";
import { Play, Pause, Square, Clock, Weight, Repeat, CheckCircle, Pencil } from "lucide-react";
import { formatDuration, formatTimeAgo } from "@/lib/workout-utils";
import { calculateVolume } from "@/lib/progressive-overload";
import { apiRequest } from "@/lib/queryClient";
import { insertWorkoutSessionSchema } from "@shared/schema";
import type { WorkoutSession, WorkoutSet, Exercise } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const MOCK_USER_ID = "user-1";

export default function ActiveWorkout() {
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  const { data: activeSession } = useQuery<WorkoutSession | null>({
    queryKey: ["/api/workout-sessions/active", MOCK_USER_ID],
  });

  const { data: sessionSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets", { sessionId: activeSession?.id }],
    enabled: !!activeSession?.id,
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Create new workout session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const sessionData = {
        userId: MOCK_USER_ID,
        name: "Quick Workout",
        startedAt: new Date().toISOString(),
      };
      
      const validation = insertWorkoutSessionSchema.safeParse(sessionData);
      if (!validation.success) throw new Error("Invalid session data");
      
      const response = await apiRequest("POST", "/api/workout-sessions", validation.data);
      return response.json();
    },
    onSuccess: () => {
      setIsWorkoutRunning(true);
      setWorkoutTime(0);
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      toast({
        title: "Workout started!",
        description: "Let's crush this session!",
      });
    },
  });

  // Complete workout session
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const totalVolume = sessionSets ? calculateVolume(sessionSets) : 0;
      const updates = {
        completedAt: new Date().toISOString(),
        duration: workoutTime,
        totalVolume,
      };
      
      const response = await apiRequest("PATCH", `/api/workout-sessions/${sessionId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      setIsWorkoutRunning(false);
      setWorkoutTime(0);
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      toast({
        title: "Workout completed!",
        description: "Great job! Your progress has been saved.",
      });
    },
  });

  const startEditing = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setEditWeight(set.weight?.toString() || "");
    setEditReps(set.reps.toString());
  };

  const cancelEditing = () => {
    setEditingSetId(null);
    setEditWeight("");
    setEditReps("");
  };

  const updateSetMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; weight?: number; reps?: number }) => {
      const response = await apiRequest("PATCH", `/api/workout-sets/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sets"] });
      toast({ title: "Set updated", description: "Your changes have been saved." });
      cancelEditing();
    },
    onError: () => {
      toast({ title: "Failed to update set", description: "Please try again", variant: "destructive" });
    },
  });

  const saveEdit = (id: string) => {
    const weight = editWeight === "" ? undefined : parseFloat(editWeight);
    const reps = editReps === "" ? undefined : parseInt(editReps, 10);
    updateSetMutation.mutate({ id, weight, reps });
  };

  // Workout timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutRunning) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutRunning]);

  // Auto-start timer when active session exists
  useEffect(() => {
    if (activeSession && !activeSession.completedAt) {
      setIsWorkoutRunning(true);
      const startTime = new Date(activeSession.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setWorkoutTime(elapsed);
    }
  }, [activeSession]);

  const handleStartWorkout = () => {
    createSessionMutation.mutate();
  };

  const handleCompleteWorkout = () => {
    if (activeSession) {
      completeSessionMutation.mutate(activeSession.id);
    }
  };

  const handleSetLogged = () => {
    setShowRestTimer(true);
    queryClient.invalidateQueries({ queryKey: ["/api/workout-sets"] });
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    toast({
      title: "Rest complete!",
      description: "Ready for your next set?",
    });
  };

  // Group sets by exercise
  const exerciseGroups = sessionSets?.reduce((groups: Record<string, WorkoutSet[]>, set) => {
    if (!groups[set.exerciseId]) {
      groups[set.exerciseId] = [];
    }
    groups[set.exerciseId].push(set);
    return groups;
  }, {}) || {};

  const totalVolume = sessionSets ? calculateVolume(sessionSets) : 0;
  const exerciseCount = Object.keys(exerciseGroups).length;

  if (!activeSession) {
    return (
      <div className="min-h-screen">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start Workout</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Begin a new training session</p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Workout?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start a new session to begin logging your exercises and tracking your progress.
              </p>
              <Button 
                onClick={handleStartWorkout}
                disabled={createSessionMutation.isPending}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                {createSessionMutation.isPending ? "Starting..." : "Start New Workout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeSession.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Started {formatTimeAgo(activeSession.startedAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDuration(workoutTime)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            </div>
            <Button
              onClick={isWorkoutRunning ? () => setIsWorkoutRunning(false) : () => setIsWorkoutRunning(true)}
              variant="outline"
              size="sm"
            >
              {isWorkoutRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Workout Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDuration(workoutTime)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Weight className="h-6 w-6 text-success-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(totalVolume)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total lbs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Repeat className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {exerciseCount}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Exercises</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Exercise Logger */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Log Exercise</h3>
            {showRestTimer ? (
              <Timer
                initialTime={120}
                isRestTimer={true}
                onComplete={handleRestComplete}
              />
            ) : (
              <ExerciseLogger sessionId={activeSession.id} onSetLogged={handleSetLogged} />
            )}
          </div>

          {/* Exercise History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Exercises</h3>
            <div className="space-y-4">
              {Object.entries(exerciseGroups).map(([exerciseId, sets]) => {
                const exercise = exercises?.find(ex => ex.id === exerciseId);
                return (
                  <Card key={exerciseId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {exercise?.name || "Unknown Exercise"}
                        </h4>
                        <Badge variant="secondary">{sets.length} sets</Badge>
                      </div>
                        <div className="space-y-2">
                          {sets.map((set, index) => (
                            <div key={set.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Set {index + 1}</span>
                              {editingSetId === set.id ? (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    value={editWeight}
                                    onChange={(e) => setEditWeight(e.target.value)}
                                    className="w-20"
                                  />
                                  <span className="text-gray-900 dark:text-white">lbs ×</span>
                                  <Input
                                    type="number"
                                    value={editReps}
                                    onChange={(e) => setEditReps(e.target.value)}
                                    className="w-14"
                                  />
                                  <Button size="sm" onClick={() => saveEdit(set.id)} disabled={updateSetMutation.isPending}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-900 dark:text-white">
                                    {set.weight} lbs × {set.reps}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => startEditing(set)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <CheckCircle className="h-4 w-4 text-success-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                    </CardContent>
                  </Card>
                );
              })}

              {exerciseCount === 0 && (
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-8 text-center">
                    <Repeat className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No exercises logged yet. Start by adding your first set!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Complete Workout Button */}
        <Card className="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-success-800 dark:text-success-200 mb-2">
              Ready to finish?
            </h3>
            <p className="text-success-700 dark:text-success-300 mb-4">
              Complete your workout to save your progress and update your stats.
            </p>
            <Button
              onClick={handleCompleteWorkout}
              disabled={completeSessionMutation.isPending}
              className="bg-success-600 hover:bg-success-700 text-white"
            >
              <Square className="h-4 w-4 mr-2" />
              {completeSessionMutation.isPending ? "Completing..." : "Complete Workout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
