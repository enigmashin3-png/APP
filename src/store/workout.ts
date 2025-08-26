import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  notes?: string;
};

export type TemplateExercise = {
  name: string;
  defaultSets: number;
};

export type Template = {
  id: string;
  name: string;
  exercises: TemplateExercise[];
};

type Settings = {
  unit: "kg" | "lb";
  theme: "system" | "light" | "dark";
  defaultRestSec: number;
};

type ExportShape = {
  history: Workout[];
  templates: Template[];
  favorites: string[];
  settings: Settings;
};

type State = {
  // data
  activeWorkout: Workout | null;
  history: Workout[];
  templates: Template[];
  favorites: string[];
  recents: string[];
  settings: Settings;

  // actions
  ensureActive: () => void;
  addExercise: (name: string) => void;
  addSet: (exId: string) => void;
  completeSet: (exId: string, setId: string, payload: Partial<SetEntry>) => void;
  finishWorkout: (notes?: string) => void;

  toggleFavoriteExercise: (name: string) => void;

  addTemplate: (name: string) => string;
  updateTemplate: (id: string, data: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  startFromTemplate: (id: string) => void;

  repeatFromHistory: (workoutId: string) => void;

  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;

  // backup
  exportAll: () => string;
  importAll: (json: string) => boolean;
  clearAll: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useWorkoutStore = create<State>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      history: [],
      templates: [],
      favorites: [],
      recents: [],
      settings: { unit: "kg", theme: "system", defaultRestSec: 90 },

      ensureActive: () => {
        if (!get().activeWorkout) {
          set({ activeWorkout: { id: uid(), startedAt: Date.now(), exercises: [] } });
        }
      },

      addExercise: (name) => {
        const s = get();
        if (!s.activeWorkout) return;
        const recents = [name, ...s.recents.filter((x) => x !== name)].slice(0, 12);
        const ex: ExerciseEntry = { id: uid(), name, sets: [] };
        set({
          recents,
          activeWorkout: { ...s.activeWorkout, exercises: [ex, ...s.activeWorkout.exercises] },
        });
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
        const restEndAt = Date.now() + get().settings.defaultRestSec * 1000;
        const exercises = w.exercises.map((e) =>
          e.id === exId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, ...payload, done: true, restEndAt } : s)),
              }
            : e
        );
        set({ activeWorkout: { ...w, exercises } });
      },

      finishWorkout: (notes) => {
        const w = get().activeWorkout;
        if (!w) return;
        const finished: Workout = { ...w, notes };
        set({ history: [finished, ...get().history], activeWorkout: null });
      },

      toggleFavoriteExercise: (name) => {
        const fav = new Set(get().favorites);
        fav.has(name) ? fav.delete(name) : fav.add(name);
        set({ favorites: Array.from(fav) });
      },

      addTemplate: (name) => {
        const id = uid();
        const t: Template = { id, name, exercises: [] };
        set({ templates: [t, ...get().templates] });
        return id;
      },

      updateTemplate: (id, data) => {
        set({ templates: get().templates.map((t) => (t.id === id ? { ...t, ...data } : t)) });
      },

      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((t) => t.id !== id) });
      },

      startFromTemplate: (id) => {
        const t = get().templates.find((x) => x.id === id);
        if (!t) return;
        const w: Workout = {
          id: uid(),
          startedAt: Date.now(),
          exercises: t.exercises.map((te) => ({
            id: uid(),
            name: te.name,
            sets: Array.from({ length: te.defaultSets }).map(() => ({ id: uid(), done: false, restEndAt: null })),
          })),
        };
        set({ activeWorkout: w });
      },

      repeatFromHistory: (workoutId) => {
        const src = get().history.find((h) => h.id === workoutId);
        if (!src) return;
        const w: Workout = {
          id: uid(),
          startedAt: Date.now(),
          exercises: src.exercises.map((e) => ({
            id: uid(),
            name: e.name,
            // same number of sets as last time, but reset values
            sets: e.sets.map(() => ({ id: uid(), done: false, restEndAt: null })),
          })),
        };
        set({ activeWorkout: w });
      },

      setSetting: (k, v) => set({ settings: { ...get().settings, [k]: v } }),

      exportAll: () => {
        const snap: ExportShape = {
          history: get().history,
          templates: get().templates,
          favorites: get().favorites,
          settings: get().settings,
        };
        return JSON.stringify(snap, null, 2);
      },

      importAll: (json) => {
        try {
          const data = JSON.parse(json) as Partial<ExportShape>;
          if (!data || typeof data !== "object") return false;
          set({
            activeWorkout: null,
            history: Array.isArray(data.history) ? data.history : [],
            templates: Array.isArray(data.templates) ? data.templates : [],
            favorites: Array.isArray(data.favorites) ? data.favorites : [],
            recents: [],
            settings: { unit: "kg", theme: "system", defaultRestSec: 90, ...(data.settings ?? {}) },
          });
          return true;
        } catch {
          return false;
        }
      },

      clearAll: () => {
        set({
          activeWorkout: null,
          history: [],
          templates: [],
          favorites: [],
          recents: [],
          settings: { unit: "kg", theme: "system", defaultRestSec: 90 },
        });
      },
    }),
    {
      name: "liftlegends-v1",
      version: 2,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
