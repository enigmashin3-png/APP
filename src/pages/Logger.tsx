import { useState } from "react";
import { format } from "date-fns";
import { useLogger } from "../lib/store/logger";

export default function Logger() {
  const { entries, add, remove } = useLogger();
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(20);
  const [notes, setNotes] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise.trim()) return;
    add({ date, exercise: exercise.trim(), sets, reps, weight, notes: notes.trim() || undefined });
    setNotes("");
    setExercise("");
  };

  return (
    <main className="min-h-dvh p-6 mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Workout Logger</h1>
      <p className="opacity-80 mt-1">Log sets, reps, and weight. Data is saved locally.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
            required
          />
        </label>

        <label className="grid gap-1 sm:col-span-1">
          <span className="text-sm opacity-80">Exercise</span>
          <input
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="Bench Press, Squat, etc."
            className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
            required
          />
        </label>

        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Sets</span>
            <input
              type="number"
              min={1}
              max={20}
              value={sets}
              onChange={(e) => setSets(+e.target.value)}
              className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Reps</span>
            <input
              type="number"
              min={1}
              max={50}
              value={reps}
              onChange={(e) => setReps(+e.target.value)}
              className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Weight (kg)</span>
            <input
              type="number"
              min={0}
              max={1000}
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(+e.target.value)}
              className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
              required
            />
          </label>
        </div>

        <label className="grid gap-1 sm:col-span-2">
          <span className="text-sm opacity-80">Notes (optional)</span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pause reps, tempo, cues..."
            className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 outline-none"
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-2xl px-4 py-2 border border-white/10 shadow hover:opacity-90"
          >
            Add Entry
          </button>
        </div>
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-medium">Entries</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Exercise</th>
                <th className="text-left px-3 py-2">Sets</th>
                <th className="text-left px-3 py-2">Reps</th>
                <th className="text-left px-3 py-2">Weight</th>
                <th className="text-left px-3 py-2">Notes</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td className="px-3 py-3 opacity-70" colSpan={7}>
                    No entries yet.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="px-3 py-2 whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2">{e.exercise}</td>
                  <td className="px-3 py-2">{e.sets}</td>
                  <td className="px-3 py-2">{e.reps}</td>
                  <td className="px-3 py-2">{e.weight}</td>
                  <td className="px-3 py-2">{e.notes ?? "-"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => remove(e.id)}
                      className="underline opacity-80 hover:opacity-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
