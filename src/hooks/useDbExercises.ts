import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { DbExercise, loadDbExercises } from "../data/exercisesDb";

export function useDbExercises() {
  const [data, setData] = useState<DbExercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadDbExercises()
      .then((list) => {
        if (alive) setData(list);
      })
      .catch((e) => {
        if (alive) setError(String(e?.message || e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fuse = useMemo(() => {
    if (!data) return null;
    return new Fuse(data, {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "primary", weight: 0.2 },
        { name: "tags", weight: 0.1 },
      ],
      threshold: 0.36,
      ignoreLocation: true,
    });
  }, [data]);

  return { data, error, loading, fuse };
}
