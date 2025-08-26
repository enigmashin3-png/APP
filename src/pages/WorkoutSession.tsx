import { useState } from "react";
import ExerciseTypeahead from "../components/ExerciseTypeahead";
import CountdownTimer from "../components/CountdownTimer";

type WorkoutSet = { weight: string; reps: string; done: boolean };

interface WorkoutExercise {
  id?: number | string;
  name: string;
  rest: number;
  sets: WorkoutSet[];
  timerRunning: boolean;
  timerId: number;
}

export default function WorkoutSession() {
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const addExercise = (item: { id?: number | string; name: string }) => {
    setExercises((prev) => [
      ...prev,
      { id: item.id, name: item.name, rest: 90, sets: [], timerRunning: false, timerId: 0 },
    ]);
    setExerciseQuery("");
  };

  const addSet = (idx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === idx ? { ...ex, sets: [...ex.sets, { weight: "", reps: "", done: false }] } : ex
      )
    );
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s));
        return { ...ex, sets };
      })
    );
  };

  const completeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, j) => (j === setIdx ? { ...s, done: true } : s));
        return { ...ex, sets, timerRunning: true, timerId: ex.timerId + 1 };
      })
    );
  };

  const onTimerComplete = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, timerRunning: false } : ex))
    );
  };

  const updateRest = (exIdx: number, value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, rest: value } : ex))
    );
  };

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h2>Start Workout</h2>
      <p className="subtle">Add exercises to begin.</p>
      <ExerciseTypeahead
        value={exerciseQuery}
        onChange={setExerciseQuery}
        onSelect={addExercise}
        placeholder="e.g., bench, squat, deadlift…"
        autoFocus
      />
      {exercises.map((ex, idx) => (
        <div
          key={idx}
          style={{ marginTop: 32, borderTop: "1px solid #eee", paddingTop: 16 }}
        >
          <h3 style={{ marginBottom: 8 }}>{ex.name}</h3>
          {ex.sets.map((s, sIdx) => (
            <div
              key={sIdx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span>{sIdx + 1}</span>
              <input
                type="number"
                value={s.weight}
                placeholder="kg"
                onChange={(e) => updateSet(idx, sIdx, "weight", e.target.value)}
                style={{ width: 60 }}
              />
              <input
                type="number"
                value={s.reps}
                placeholder="reps"
                onChange={(e) => updateSet(idx, sIdx, "reps", e.target.value)}
                style={{ width: 60 }}
              />
              {s.done ? (
                <span style={{ color: "green" }}>✓</span>
              ) : (
                <button onClick={() => completeSet(idx, sIdx)}>Done</button>
              )}
            </div>
          ))}
          {ex.timerRunning && (
            <div style={{ marginBottom: 8 }}>
              Rest: {" "}
              <CountdownTimer
                key={ex.timerId}
                seconds={ex.rest}
                running={true}
                onComplete={() => onTimerComplete(idx)}
              />
            </div>
          )}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}
          >
            <button onClick={() => addSet(idx)}>Add Set ({format(ex.rest)})</button>
            <label>
              Rest (sec):
              <input
                type="number"
                value={ex.rest}
                onChange={(e) => updateRest(idx, parseInt(e.target.value, 10) || 0)}
                style={{ width: 60, marginLeft: 4 }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}