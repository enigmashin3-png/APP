import React, { useMemo, useState } from "react";
import exercisesData from "../../data/exercises.json";
import { useDbExercises } from "../hooks/useDbExercises";
import ExerciseTypeahead from "./ExerciseTypeahead";

type Exercise = { id?: number | string; name: string; muscle?: string };

type Props = {
  onAdd: (items: Exercise[]) => void;
  onClose: () => void;
};

export default function ExercisePicker({ onAdd, onClose }: Props) {
  // Track selected exercises by a stringified key to ensure type compatibility
  const [selected, setSelected] = useState<Record<string, Exercise>>({});
  const [query, setQuery] = useState("");
  const { data } = useDbExercises();

  // Build the alphabetical groups from DB if loaded; fallback to bundled JSON
  const groups = useMemo(() => {
    const list: Exercise[] = (data && data.length > 0)
      ? data.map((e) => ({ id: e.id, name: e.name, muscle: e.primary }))
      : (exercisesData as Exercise[]);
    const g: Record<string, Exercise[]> = {};
    list.forEach((ex) => {
      const letter = ex.name.charAt(0).toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(ex);
    });
    Object.keys(g).forEach((l) => g[l].sort((a, b) => a.name.localeCompare(b.name)));
    return g;
  }, [data]);

  const toggle = (ex: Exercise) => {
    setSelected((prev) => {
      const copy = { ...prev };
      const key = String(ex.id ?? ex.name);
      if (copy[key]) {
        delete copy[key];
      } else {
        copy[key] = ex;
      }
      return copy;
    });
  };

  const addAndClose = () => {
    onAdd(Object.values(selected));
  };

  const hasSelection = Object.keys(selected).length > 0;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2>Add exercises</h2>
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <ExerciseTypeahead
          value={query}
          onChange={setQuery}
          placeholder="Search exercises..."
          onSelect={(item) => {
            toggle({ id: item.id, name: item.name, muscle: item.muscle });
            setQuery("");
          }}
        />
      </div>
      <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: 16, paddingBottom: 80 }}>
        {Object.keys(groups)
          .sort()
          .map((letter) => (
            <div key={letter} style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>{letter}</h4>
              {groups[letter].map((ex) => {
                const active = Boolean(selected[ex.id ?? ex.name]);
                return (
                  <div
                    key={ex.id ?? ex.name}
                    onClick={() => toggle(ex)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: active ? "rgba(0,0,0,0.1)" : "transparent",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{ex.name}</span>
                    {ex.muscle && (
                      <span style={{ opacity: 0.7, fontSize: 12 }}>{ex.muscle}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
      {/* Cancel button */}
      <div style={{ marginTop: 12 }}>
        <button onClick={onClose}>Cancel</button>
      </div>

      {/* Floating Add button (bottom-right) */}
      {hasSelection && (
        <button
          onClick={addAndClose}
          title="Add selected"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            width: 56,
            height: 56,
            borderRadius: 9999,
            background: "#3b82f6",
            color: "white",
            fontSize: 28,
            lineHeight: "56px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          +
          <span
            style={{
              position: "absolute",
              top: -6,
              left: -6,
              minWidth: 22,
              height: 22,
              borderRadius: 12,
              background: "#111827",
              color: "#fff",
              fontSize: 12,
              lineHeight: "22px",
              textAlign: "center",
              padding: "0 6px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {Object.keys(selected).length}
          </span>
        </button>
      )}
    </div>
  );
}
