import React, { useMemo, useState } from "react";
import exercisesData from "../../data/exercises.json" assert { type: "json" };

type Exercise = { id?: number | string; name: string; muscle?: string };

type Props = {
  onAdd: (items: Exercise[]) => void;
  onClose: () => void;
};

export default function ExercisePicker({ onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<Record<string | number, Exercise>>({});

  const groups = useMemo(() => {
    const g: Record<string, Exercise[]> = {};
    (exercisesData as Exercise[]).forEach((ex) => {
      const letter = ex.name.charAt(0).toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(ex);
    });
    Object.keys(g).forEach((l) => g[l].sort((a, b) => a.name.localeCompare(b.name)));
    return g;
  }, []);

  const toggle = (ex: Exercise) => {
    setSelected((prev) => {
      const copy = { ...prev };
      const key = ex.id ?? ex.name;
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
    onClose();
  };

  const hasSelection = Object.keys(selected).length > 0;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2>Add exercises</h2>
      <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: 16 }}>
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
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: active ? "rgba(0,0,0,0.1)" : "transparent",
                      borderRadius: 4,
                    }}
                  >
                    {ex.name}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={addAndClose} disabled={!hasSelection}>
          Add Selected
        </button>
      </div>
    </div>
  );
}
