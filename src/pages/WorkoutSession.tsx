import React, { useState } from "react";
import ExerciseTypeahead from "../components/ExerciseTypeahead";

export default function WorkoutSession() {
  const [exercise, setExercise] = useState("");

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h2>Start Workout</h2>
      <p className="subtle">Add exercises to begin.</p>
      <ExerciseTypeahead
        value={exercise}
        onChange={setExercise}
        onSelect={(item) => console.log("Selected:", item)}
        placeholder="e.g., bench, squat, deadlift…"
        autoFocus
      />
    </div>
  );
}
