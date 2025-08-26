import { useEffect, useState } from "react";
import CountdownTimer from "../components/CountdownTimer";
import ExercisePicker from "../components/ExercisePicker";

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
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const addExercises = (items: { id?: number | string; name: string }[]) => {
    setExercises((prev) => [
      ...prev,
      ...items.map((item) => ({
        id: item.id,
        name: item.name,
        rest: 90,
        sets: [],
        timerRunning: false,
        timerId: 0,
      })),
    ]);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {running ? (
          <span>{format(elapsed)}</span>
        ) : (
          <button onClick={() => setRunning(true)}>Start</button>
        )}
        <button onClick={() => setShowPicker(true)}>Add Exercise</button>
      </div>
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
      {showPicker && (
        <ExercisePicker
          onAdd={(items) => {
            addExercises(items);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}