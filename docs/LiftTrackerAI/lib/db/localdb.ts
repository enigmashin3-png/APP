import Dexie, { Table } from "dexie";

export type UserPref = { id: string; key: string; value: any; updatedAt: number }; // id = `${key}`
export type Workout = { id: string; date: string; name?: string; notes?: string }; // id = uuid
export type SetEntry = {
  id: string;
  workoutId: string;
  exerciseId: string;
  reps: number;
  weight: number;
  rpe?: number;
  date: string;
  notes?: string;
};
export type VoiceLog = {
  id: string;
  rawText: string;
  intent?: string;
  payload?: any;
  createdAt: number;
};
export type CoachTip = { id: string; message: string; context: string; createdAt: number };

class LiftLocalDB extends Dexie {
  userPrefs!: Table<UserPref, string>;
  workouts!: Table<Workout, string>;
  sets!: Table<SetEntry, string>;
  voiceLogs!: Table<VoiceLog, string>;
  coachTips!: Table<CoachTip, string>;

  constructor() {
    super("liftlegends-localdb");
    this.version(1).stores({
      userPrefs: "&id, key, updatedAt",
      workouts: "&id, date",
      sets: "&id, workoutId, exerciseId, date",
      voiceLogs: "&id, createdAt",
      coachTips: "&id, createdAt",
    });
  }
}
export const localdb = new LiftLocalDB();
