import React, { useState } from "react";
import ExerciseTypeahead from "../components/ExerciseTypeahead";

export default function ExerciseFormDemo() {
  const [exercise, setExercise] = useState("");

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 8 }}>Add Exercise</h2>
      <p style={{ color: "#555", marginTop: 0 }}>Start typing and pick from suggestions.</p>
      <ExerciseTypeahead
        value={exercise}
        onChange={setExercise}
        onSelect={(item) => console.log("Selected:", item)}
        placeholder="e.g., bench, squat, deadlift…"
        autoFocus
      />
      <div style={{ marginTop: 12, color: "#333" }}>
        <strong>Selected name:</strong> {exercise || <em>none</em>}
      </div>
    </div>
  );
}
