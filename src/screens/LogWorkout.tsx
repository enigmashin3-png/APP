import { useLog } from "../store/log";

export default function LogWorkout() {
  const { sets, add, remove, update } = useLog();

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Log Workout</h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget as HTMLFormElement);
          const rpeRaw = f.get("rpe");
          add({
            exerciseId: String(f.get("ex") ?? ""),
            reps: Number(f.get("reps") ?? 0),
            weight: Number(f.get("w") ?? 0),
            rpe: rpeRaw ? Number(rpeRaw) : undefined,
            note: String(f.get("note") ?? ""),
          });
          (e.currentTarget as HTMLFormElement).reset();
        }}
      >
        <input name="ex" placeholder="exercise id" className="input input-bordered" />
        <input
          name="reps"
          placeholder="reps"
          type="number"
          className="input input-bordered w-24"
        />
        <input
          name="w"
          placeholder="kg"
          type="number"
          className="input input-bordered w-24"
        />
        <input
          name="rpe"
          placeholder="RPE"
          type="number"
          step="0.5"
          className="input input-bordered w-24"
        />
        <input name="note" placeholder="note" className="input input-bordered" />
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {sets.map((s) => (
          <li
            key={s.id}
            className="border p-2 rounded-xl flex items-center justify-between"
          >
            <div>
              #{s.exerciseId} — {s.reps}×{s.weight}kg {s.rpe ? `@RPE ${s.rpe}` : ""}
            </div>
            <div className="flex gap-2">
              <button
                className="btn"
                onClick={() =>
                  update(s.id, {
                    note: prompt("Note?", s.note ?? "") ?? s.note,
                  })
                }
              >
                Note
              </button>
              <button className="btn" onClick={() => remove(s.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

