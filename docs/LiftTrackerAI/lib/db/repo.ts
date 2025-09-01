import {
  localdb,
  type Workout,
  type SetEntry,
  type UserPref,
  type VoiceLog,
  type CoachTip,
} from "./localdb";

// ---- Preferences ----
export async function setPref(key: string, value: any) {
  const id = key;
  const row: UserPref = { id, key, value, updatedAt: Date.now() };
  await localdb.userPrefs.put(row);
  return row;
}
export async function getPref<T = any>(key: string, fallback?: T): Promise<T> {
  const row = await localdb.userPrefs.get(key);
  return (row?.value ?? fallback) as T;
}

// ---- Workouts / Sets ----
export async function addWorkout(w: Omit<Workout, "id"> & { id?: string }) {
  const id = w.id ?? crypto.randomUUID();
  await localdb.workouts.put({ id, date: w.date, name: w.name, notes: w.notes });
  return id;
}
export async function addSet(s: Omit<SetEntry, "id"> & { id?: string }) {
  const id = s.id ?? crypto.randomUUID();
  await localdb.sets.put({ ...s, id });
  return id;
}
export async function getRecentSets(limit = 50): Promise<SetEntry[]> {
  return await localdb.sets.orderBy("date").reverse().limit(limit).toArray();
}
export async function getSetsByWorkout(workoutId: string): Promise<SetEntry[]> {
  return localdb.sets.where({ workoutId }).toArray();
}
export async function deleteWorkout(workoutId: string) {
  await localdb.sets.where({ workoutId }).delete();
  await localdb.workouts.delete(workoutId);
}

// ---- Voice logs / Coach ----
export async function addVoiceLog(v: Omit<VoiceLog, "id" | "createdAt">) {
  const row = { id: crypto.randomUUID(), createdAt: Date.now(), ...v };
  await localdb.voiceLogs.add(row);
  return row.id;
}
export async function addCoachTip(t: Omit<CoachTip, "id" | "createdAt">) {
  const row = { id: crypto.randomUUID(), createdAt: Date.now(), ...t };
  await localdb.coachTips.add(row);
  return row.id;
}

// ---- Export / Import ----
export async function exportAll() {
  const [prefs, workouts, sets, voice, tips] = await Promise.all([
    localdb.userPrefs.toArray(),
    localdb.workouts.toArray(),
    localdb.sets.toArray(),
    localdb.voiceLogs.toArray(),
    localdb.coachTips.toArray(),
  ]);
  return { version: 1, exportedAt: new Date().toISOString(), prefs, workouts, sets, voice, tips };
}
export async function importAll(payload: any, merge = true) {
  const { prefs = [], workouts = [], sets = [], voice = [], tips = [] } = payload || {};
  await localdb.transaction(
    "rw",
    [localdb.userPrefs, localdb.workouts, localdb.sets, localdb.voiceLogs, localdb.coachTips],
    async () => {
      if (!merge) {
        await Promise.all([
          localdb.userPrefs.clear(),
          localdb.workouts.clear(),
          localdb.sets.clear(),
          localdb.voiceLogs.clear(),
          localdb.coachTips.clear(),
        ]);
      }
      await localdb.userPrefs.bulkPut(prefs);
      await localdb.workouts.bulkPut(workouts);
      await localdb.sets.bulkPut(sets);
      await localdb.voiceLogs.bulkPut(voice);
      await localdb.coachTips.bulkPut(tips);
    },
  );
}
