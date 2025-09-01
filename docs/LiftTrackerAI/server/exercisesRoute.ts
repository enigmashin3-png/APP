import type { Request, Response } from "express";
// @ts-ignore: fuse.js has no type declarations
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";

type Exercise = { id?: number | string; name: string; muscle?: string; equipment?: string };

let EXERCISES: Exercise[] = [];
let FUSE: Fuse<Exercise> | null = null;

function loadExercises() {
  const p = path.resolve(process.cwd(), "data", "exercises.json");
  const raw = fs.readFileSync(p, "utf8");
  EXERCISES = JSON.parse(raw);
  FUSE = new Fuse(EXERCISES, {
    includeScore: true,
    threshold: 0.35,
    keys: [
      { name: "name", weight: 0.8 },
      { name: "muscle", weight: 0.15 },
      { name: "equipment", weight: 0.05 },
    ],
  });
  console.log(`[exercisesRoute] Loaded ${EXERCISES.length} exercises from ${p}`);
}

export function initExerciseRoute(app: any) {
  if (!FUSE) loadExercises();

  app.get("/api/exercises", (req: Request, res: Response) => {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit || 10), 50);

    if (!q) {
      return res.json(EXERCISES.slice(0, limit));
    }
    const results = FUSE!.search(q, { limit }).map((r: any) => r.item);
    return res.json(results);
  });
}
