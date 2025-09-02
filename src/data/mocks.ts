export interface Workout {
  id: string;
  name: string;
  date: string;
  volume: number;
  durationMin: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
}

export const MOCK_WORKOUTS: Workout[] = [
  { id: "w1", name: "Upper A", date: "2025-09-01", volume: 12650, durationMin: 68 },
  { id: "w2", name: "Lower A", date: "2025-08-30", volume: 10210, durationMin: 61 },
  { id: "w3", name: "Push B", date: "2025-08-28", volume: 11800, durationMin: 64 },
  { id: "w4", name: "Pull B", date: "2025-08-26", volume: 11190, durationMin: 59 },
];

export const EXERCISES: Exercise[] = [
  { id: "e1", name: "Bench Press", muscle: "Chest" },
  { id: "e2", name: "Incline DB Press", muscle: "Chest" },
  { id: "e3", name: "Lat Pulldown", muscle: "Back" },
  { id: "e4", name: "Seated Row", muscle: "Back" },
  { id: "e5", name: "DB Shoulder Press", muscle: "Shoulders" },
  { id: "e6", name: "EZ-Bar Curl", muscle: "Biceps" },
  { id: "e7", name: "Cable Triceps Pushdown", muscle: "Triceps" },
];

export const QUICK_START_TEMPLATES = [
  "Upper Body",
  "Lower Body",
  "Push Day",
  "Pull Day",
  "Full Body",
  "Arms & Shoulders",
];
