import { create } from "zustand";

export type SetEntry = {
  id: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  done?: boolean;
  restEndAt?: number | null;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: SetEntry[];
};

export type Workout = {
  id: string;
  startedAt: number;
  exercises: ExerciseEntry[];
};

type State = {
  activeWorkout: Workout | null;
  history: Workout[];
  ensureActive: () => void;
  addExercise: (name: string) => void;
  addSet: (exId: string) => void;
  completeSet: (exId: string, setId: string, payload: Partial<SetEntry>) => void;
  finishWorkout: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useWorkoutStore = create<State>((set, get) => ({
  activeWorkout: null,
  history: [],
  ensureActive: () => {
    if (!get().activeWorkout) {
      set({
        activeWorkout: { id: uid(), startedAt: Date.now(), exercises: [] },
      });
    }
  },
  addExercise: (name) => {
    const w = get().activeWorkout;
    if (!w) return;
    const ex: ExerciseEntry = { id: uid(), name, sets: [] };
    set({ activeWorkout: { ...w, exercises: [ex, ...w.exercises] } });
  },
  addSet: (exId) => {
    const w = get().activeWorkout;
    if (!w) return;
    const exercises = w.exercises.map((e) =>
      e.id === exId ? { ...e, sets: [...e.sets, { id: uid(), done: false, restEndAt: null }] } : e
    );
    set({ activeWorkout: { ...w, exercises } });
  },
  completeSet: (exId, setId, payload) => {
    const w = get().activeWorkout;
    if (!w) return;
    const now = Date.now();
    const exercises = w.exercises.map((e) =>
      e.id === exId
        ? {
            ...e,
            sets: e.sets.map((s) =>
              s.id === setId ? { ...s, ...payload, done: true, restEndAt: now + 90_000 } : s
            ),
          }
        : e
    );
    set({ activeWorkout: { ...w, exercises } });
  },
  finishWorkout: () => {
    const w = get().activeWorkout;
    if (!w) return;
    set({ history: [w, ...get().history], activeWorkout: null });
  },
}));
