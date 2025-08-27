export type LogEntry = {
  id: string;
  date: string;     // ISO, e.g. "2025-08-27"
  exercise: string;
  sets: number;
  reps: number;
  weight: number;   // kg
  notes?: string;
};
