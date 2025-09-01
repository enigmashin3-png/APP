import React, { useState } from "react";

export default function Workout() {
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSets, setExerciseSets] = useState("");

  const addExercise = () => {
    if (!exerciseName.trim() || !exerciseSets) {
      alert("Please fill in both fields!");
      return;
    }

    const newExercise = {
      id: exercises.length,
      name: exerciseName.trim(),
      sets: exerciseSets,
    };

    setExercises([...exercises, newExercise]);
    setExerciseName("");
    setExerciseSets("");
  };

  return (
    <div>
      <input
        type="text"
        value={exerciseName}
        onChange={(e) => setExerciseName(e.target.value)}
        placeholder="Exercise name"
      />
      <input
        type="number"
        value={exerciseSets}
        onChange={(e) => setExerciseSets(e.target.value)}
        placeholder="Sets"
      />
      <button onClick={addExercise}>Add Exercise</button>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            {exercise.name} - {exercise.sets}
          </li>
        ))}
      </ul>
    </div>
  );
}
