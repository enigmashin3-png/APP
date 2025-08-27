import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { LogEntry } from "../../types/log";

type LoggerState = {
  entries: LogEntry[];
  add: (e: Omit<LogEntry, "id">) => void;
  update: (id: string, patch: Partial<LogEntry>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useLogger = create<LoggerState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (e) =>
        set((s) => ({ entries: [{ ...e, id: nanoid() }, ...s.entries] })),
      update: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((x) => x.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "ll-logger-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
