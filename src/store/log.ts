import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SetEntry = {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  rpe?: number;
  note?: string;
  ts: number;
};

type State = {
  sets: SetEntry[];
  add: (s: Omit<SetEntry, "id" | "ts">) => void;
  remove: (id: string) => void;
  update: (id: string, p: Partial<SetEntry>) => void;
};

export const useLog = create<State>()(
  persist(
    (set, get) => ({
      sets: [],
      add: (s) =>
        set({
          sets: [...get().sets, { ...s, id: crypto.randomUUID(), ts: Date.now() }],
        }),
      remove: (id) => set({ sets: get().sets.filter((x) => x.id !== id) }),
      update: (id, p) =>
        set({
          sets: get().sets.map((x) => (x.id === id ? { ...x, ...p } : x)),
        }),
    }),
    { name: "ll-log" },
  ),
);

