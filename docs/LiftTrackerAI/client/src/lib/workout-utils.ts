export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return then.toLocaleDateString();
  }
}

export function getMuscleGroupColor(muscleGroup: string): string {
  const colors: Record<string, string> = {
    chest: "bg-red-100 text-red-800",
    back: "bg-blue-100 text-blue-800",
    legs: "bg-green-100 text-green-800",
    shoulders: "bg-yellow-100 text-yellow-800",
    arms: "bg-purple-100 text-purple-800",
    core: "bg-pink-100 text-pink-800",
    cardio: "bg-orange-100 text-orange-800",
  };
  
  return colors[muscleGroup.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-red-100 text-red-800",
  };
  
  return colors[level.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function calculateRestTime(exerciseType: string, intensity: 'light' | 'moderate' | 'heavy'): number {
  const baseTimes: Record<string, number> = {
    compound: 180, // 3 minutes for compound movements
    isolation: 90, // 1.5 minutes for isolation
    cardio: 60,    // 1 minute for cardio
  };

  const intensityMultiplier: Record<string, number> = {
    light: 0.7,
    moderate: 1.0,
    heavy: 1.3,
  };

  const baseTime = baseTimes[exerciseType] || baseTimes.isolation;
  return Math.round(baseTime * intensityMultiplier[intensity]);
}
