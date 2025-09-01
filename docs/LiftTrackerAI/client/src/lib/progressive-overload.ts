import type { WorkoutSet } from "@shared/schema";

export interface ProgressiveOverloadSuggestion {
  weight: number;
  reps: number;
  reason: string;
}

export function calculateProgressiveOverload(
  previousSets: WorkoutSet[],
  targetReps: number = 8,
): ProgressiveOverloadSuggestion {
  if (previousSets.length === 0) {
    return {
      weight: 135, // Starting weight for most exercises
      reps: targetReps,
      reason: "Starting weight for new exercise",
    };
  }

  // Get the most recent workout sets
  const lastWorkout = previousSets
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 4); // Last 4 sets from most recent workout

  if (lastWorkout.length === 0) {
    return {
      weight: 135,
      reps: targetReps,
      reason: "Starting weight for new exercise",
    };
  }

  const lastSet = lastWorkout[0];
  const avgWeight =
    lastWorkout.reduce((sum, set) => sum + (set.weight || 0), 0) / lastWorkout.length;
  const avgReps = lastWorkout.reduce((sum, set) => sum + set.reps, 0) / lastWorkout.length;

  // Progressive overload rules:
  // 1. If you can complete all sets with good form, increase weight by 2.5-5 lbs
  // 2. If you're struggling with current weight, try to add reps first
  // 3. If you can do significantly more reps than target, increase weight

  const allSetsCompleted = lastWorkout.every((set) => set.reps >= targetReps);
  const significantlyMoreReps = avgReps > targetReps + 2;

  if (allSetsCompleted || significantlyMoreReps) {
    // Increase weight
    const weightIncrease = avgWeight <= 100 ? 2.5 : 5; // Smaller increases for lighter weights
    return {
      weight: Math.round((avgWeight + weightIncrease) * 2) / 2, // Round to nearest 2.5 lbs
      reps: targetReps,
      reason: allSetsCompleted
        ? "All sets completed successfully - time to increase weight!"
        : "Completing more reps than target - increase weight to maintain intensity",
    };
  }

  const strugglingWithWeight = avgReps < targetReps - 1;

  if (strugglingWithWeight) {
    // Try to add reps or maintain current weight
    return {
      weight: avgWeight,
      reps: Math.min(targetReps, Math.ceil(avgReps) + 1),
      reason: "Focus on adding reps before increasing weight",
    };
  }

  // Maintain current progression
  return {
    weight: avgWeight,
    reps: targetReps,
    reason: "Continue with current weight and aim for consistent reps",
  };
}

export function calculateOneRepMax(weight: number, reps: number): number {
  // Using Brzycki formula: 1RM = weight / (1.0278 - 0.0278 × reps)
  if (reps === 1) return weight;
  if (reps > 15) return weight; // Formula becomes unreliable for high reps

  return Math.round(weight / (1.0278 - 0.0278 * reps));
}

export function calculateVolume(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => {
    return total + (set.weight || 0) * set.reps;
  }, 0);
}
