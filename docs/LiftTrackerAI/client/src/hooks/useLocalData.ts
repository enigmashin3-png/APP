"use client";
import { useEffect, useState } from "react";
import {
  addSet,
  addWorkout,
  getRecentSets,
  setPref,
  getPref,
  exportAll,
  importAll,
} from "@lib/db/repo";
import type { SetEntry } from "@lib/db/localdb";

export function useRecentSets(limit = 50) {
  const [data, setData] = useState<SetEntry[]>([]);
  useEffect(() => {
    getRecentSets(limit).then(setData);
  }, [limit]);
  return { data, refresh: async () => setData(await getRecentSets(limit)) };
}

export function usePrefs<T = any>(key: string, initial?: T) {
  const [value, setValue] = useState<T | undefined>(initial);
  useEffect(() => {
    getPref<T>(key, initial as T).then(setValue);
  }, [key]);
  async function save(v: T) {
    await setPref(key, v);
    setValue(v);
  }
  return { value, save };
}

// Convenience actions
export const LocalActions = { addWorkout, addSet, exportAll, importAll };
