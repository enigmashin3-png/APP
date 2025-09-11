import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SetEntry = {
  id: string;
  weight?: number;
  reps?: number;
  rpe?: number;
  done?: boolean;
  restEndAt?: number | null;
  warmup?: boolean;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: SetEntry[];
  // Optional per-exercise settings/metadata
  restSec?: number;
  note?: string;
  supersetId?: string;
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
  barWeightKg: number;
  syncUrl?: string;
  syncKey?: string;
  coachStream?: boolean;
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
  addExerciseAndGetId: (name: string) => string;
  removeExercise: (exId: string) => void;
  replaceExercise: (exId: string, name: string) => void;
  setExercise: (exId: string, data: Partial<ExerciseEntry>) => void;
  addSet: (exId: string, warmup?: boolean) => void;
  addWarmupSets: (exId: string, count?: number) => void;
  deleteSet: (exId: string, setId: string) => void;
  moveExercise: (exId: string, dir: 'up' | 'down') => void;
  moveSet: (exId: string, setId: string, dir: 'up' | 'down') => void;
  updateSet: (exId: string, setId: string, payload: Partial<SetEntry>) => void;
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
      settings: {
        unit: "kg",
        theme: "system",
        defaultRestSec: 90,
        barWeightKg: 20,
        syncUrl: "",
        syncKey: "",
        coachStream:
          (typeof window !== 'undefined' &&
            (window as unknown as Record<string, unknown>)?.VITE_COACH_STREAM_DEFAULT !== undefined)
            ? Boolean((window as unknown as Record<string, unknown>).VITE_COACH_STREAM_DEFAULT)
            : Boolean((import.meta as unknown as { env?: Record<string, unknown> })?.env?.VITE_COACH_STREAM_DEFAULT) || false,
      },

      ensureActive: () => {
        if (!get().activeWorkout) {
          set({ activeWorkout: { id: uid(), startedAt: Date.now(), exercises: [] } });
        }
      },

      addExercise: (name) => {
        const s = get();
        if (!s.activeWorkout) return;
        const recents = [name, ...s.recents.filter((x) => x !== name)].slice(0, 12);
        const ex: ExerciseEntry = { id: uid(), name, sets: [], restSec: s.settings.defaultRestSec };
        set({
          recents,
          activeWorkout: { ...s.activeWorkout, exercises: [ex, ...s.activeWorkout.exercises] },
        });
      },

      addExerciseAndGetId: (name) => {
        const s = get();
        if (!s.activeWorkout) return "";
        const recents = [name, ...s.recents.filter((x) => x !== name)].slice(0, 12);
        const id = uid();
        const ex: ExerciseEntry = { id, name, sets: [], restSec: s.settings.defaultRestSec };
        set({
          recents,
          activeWorkout: { ...s.activeWorkout, exercises: [ex, ...s.activeWorkout.exercises] },
        });
        return id;
      },

      removeExercise: (exId) => {
        const w = get().activeWorkout;
        if (!w) return;
        set({ activeWorkout: { ...w, exercises: w.exercises.filter((e) => e.id !== exId) } });
      },

      replaceExercise: (exId, name) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) => (e.id === exId ? { ...e, name } : e));
        set({ activeWorkout: { ...w, exercises } });
      },

      setExercise: (exId, data) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) => (e.id === exId ? { ...e, ...data } : e));
        set({ activeWorkout: { ...w, exercises } });
      },

      addSet: (exId, warmup = false) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) =>
          e.id === exId
            ? { ...e, sets: [...e.sets, { id: uid(), done: false, restEndAt: null, warmup }] }
            : e,
        );
        set({ activeWorkout: { ...w, exercises } });
      },

      addWarmupSets: (exId, count = 2) => {
        const w = get().activeWorkout;
        if (!w) return;
        const warmups = Array.from({ length: count }).map(() => ({ id: uid(), done: false, restEndAt: null, warmup: true } as SetEntry));
        const exercises = w.exercises.map((e) => (e.id === exId ? { ...e, sets: [...e.sets, ...warmups] } : e));
        set({ activeWorkout: { ...w, exercises } });
      },

      deleteSet: (exId, setId) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) =>
          e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
        );
        set({ activeWorkout: { ...w, exercises } });
      },

      moveExercise: (exId, dir) => {
        const w = get().activeWorkout;
        if (!w) return;
        const idx = w.exercises.findIndex((e) => e.id === exId);
        if (idx < 0) return;
        const arr = [...w.exercises];
        const newIdx = dir === 'up' ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
        if (newIdx === idx) return;
        const [ex] = arr.splice(idx, 1);
        arr.splice(newIdx, 0, ex);
        set({ activeWorkout: { ...w, exercises: arr } });
      },

      moveSet: (exId, setId, dir) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) => {
          if (e.id !== exId) return e;
          const idx = e.sets.findIndex((s) => s.id === setId);
          if (idx < 0) return e;
          const arr = [...e.sets];
          const newIdx = dir === 'up' ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
          if (newIdx === idx) return e;
          const [st] = arr.splice(idx, 1);
          arr.splice(newIdx, 0, st);
          return { ...e, sets: arr };
        });
        set({ activeWorkout: { ...w, exercises } });
      },

      updateSet: (exId, setId, payload) => {
        const w = get().activeWorkout;
        if (!w) return;
        const exercises = w.exercises.map((e) =>
          e.id === exId ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...payload } : s)) } : e,
        );
        set({ activeWorkout: { ...w, exercises } });
      },

      completeSet: (exId, setId, payload) => {
        const w = get().activeWorkout;
        if (!w) return;
        const ex = w.exercises.find((e) => e.id === exId);
        const restSec = (ex?.restSec as number | undefined) ?? get().settings.defaultRestSec;
        const restEndAt = Date.now() + restSec * 1000;
        const exercises = w.exercises.map((e) =>
          e.id === exId
            ? {
                ...e,
                sets: e.sets.map((s) =>
                  s.id === setId ? { ...s, ...payload, done: true, restEndAt } : s,
                ),
              }
            : e,
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
        if (fav.has(name)) {
          fav.delete(name);
        } else {
          fav.add(name);
        }
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
            sets: Array.from({ length: te.defaultSets }).map(() => ({
              id: uid(),
              done: false,
              restEndAt: null,
            })),
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
            settings: {
              unit: "kg",
              theme: "system",
              defaultRestSec: 90,
              barWeightKg: 20,
              syncUrl: "",
              syncKey: "",
              ...(data.settings ?? {}),
            },
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
          settings: {
            unit: "kg",
            theme: "system",
            defaultRestSec: 90,
            barWeightKg: 20,
            syncUrl: "",
            syncKey: "",
          },
        });
      },
    }),
    {
      name: "liftlegends-v1",
      version: 6,
      storage: createJSONStorage(() => localStorage),
      migrate: (state: unknown, fromVersion: number) => {
        const container = (state as { state?: unknown }) ?? {};
        const s = (container.state ?? state) as { settings?: Record<string, unknown>; activeWorkout?: any } | undefined;
        if (!s) return state as unknown;
        if (fromVersion < 3) {
          if (s.settings && typeof s.settings.barWeightKg === "undefined") {
            s.settings.barWeightKg = 20;
          }
        }
        if (fromVersion < 4) {
          if (s.settings) {
            if (typeof s.settings.syncUrl === "undefined") s.settings.syncUrl = "";
            if (typeof s.settings.syncKey === "undefined") s.settings.syncKey = "";
          }
        }
        if (fromVersion < 5) {
          if (s.settings && typeof s.settings.coachStream === "undefined") {
            s.settings.coachStream = false;
          }
        }
        if (fromVersion < 6) {
          // Ensure new fields exist
          const w = (s as any).activeWorkout as Workout | undefined;
          if (w) {
            w.exercises = (w.exercises || []).map((e: any) => ({
              restSec: (e.restSec ?? (s.settings?.defaultRestSec as number | undefined)) as number | undefined,
              ...e,
            }));
          }
        }
        return state as unknown;
      },
    },
  ),
);
