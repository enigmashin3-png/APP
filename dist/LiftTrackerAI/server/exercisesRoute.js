import Fuse from "fuse.js";
import fs from "fs";
import path from "path";
let EXERCISES = [];
let FUSE = null;
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
            { name: "equipment", weight: 0.05 }
        ],
    });
    console.log(`[exercisesRoute] Loaded ${EXERCISES.length} exercises from ${p}`);
}
export function initExerciseRoute(app) {
    if (!FUSE)
        loadExercises();
    app.get("/api/exercises", (req, res) => {
        const q = String(req.query.q || "").trim();
        const limit = Math.min(Number(req.query.limit || 10), 50);
        if (!q) {
            return res.json(EXERCISES.slice(0, limit));
        }
        const results = FUSE.search(q, { limit }).map(r => r.item);
        return res.json(results);
    });
}
