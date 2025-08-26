import initSqlJs from "sql.js";
// @ts-ignore
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type DbExercise = {
  id: string;
  name: string;
  primary: string;
  equipment: string[];
  description?: string;
  tags?: string[];
  // media scaffolding (safe if missing)
  gifUrl?: string;
  imageUrl?: string;
  images?: string[];
};

let _cache: DbExercise[] | null = null;
let _loading: Promise<DbExercise[]> | null = null;

function parseListish(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  return String(val)
    .split(/[,/;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeRow(row: Record<string, any>): DbExercise {
  const equipment = parseListish(row.equipment ?? row.equipments ?? row.equipment_list);
  const tags = parseListish(row.tags ?? row.tag_list);

  // media scaffolding — these can be filled later; safe to be undefined now
  const gifUrl =
    row.gif_url ?? row.gif ?? row.media_gif ?? undefined;
  const imageUrl =
    row.image_url ?? row.image ?? row.thumbnail ?? undefined;
  const images = parseListish(row.images ?? row.gallery);

  return {
    id: String(row.id ?? row.slug ?? row.name),
    name: String(row.name),
    primary: String(row.primary ?? row.primary_muscle ?? row.muscle ?? "Other"),
    equipment,
    description: row.description ?? row.instructions ?? row.notes ?? undefined,
    tags,
    gifUrl: gifUrl ? String(gifUrl) : undefined,
    imageUrl: imageUrl ? String(imageUrl) : undefined,
    images: images.length ? images : undefined,
  };
}

async function queryAll(dbBytes: Uint8Array, q: string): Promise<Record<string, any>[]> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database(dbBytes);
  try {
    const res = db.exec(q);
    if (!res?.[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((row: any[]) => {
      const o: Record<string, any> = {};
      row.forEach((v, i) => (o[cols[i]] = v));
      return o;
    });
  } finally {
    db.close();
  }
}

async function bestEffortRead(dbBytes: Uint8Array): Promise<DbExercise[]> {
  const candidates = [
    `SELECT id, name, primary_muscle AS primary, equipment, description, tags, gif_url, image_url, images FROM exercises`,
    `SELECT id, name, muscle AS primary, equipment, description, tags, gif_url, image_url, images FROM exercises`,
    `SELECT id, name, primary AS primary, equipment, instructions AS description, tags, gif_url, image_url, images FROM exercise`,
    `SELECT id, name, primary_muscle AS primary, equipment_list AS equipment, instructions AS description FROM exercise_library`,
    `SELECT name, description FROM exercises`,
  ];
  for (const q of candidates) {
    try {
      const rows = await queryAll(dbBytes, q);
      if (rows.length) {
        return rows
          .filter((r) => r.name)
          .map(normalizeRow)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch {
      // try next
    }
  }
  // last fallback: first table
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database(dbBytes);
  try {
    const res = db.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name LIMIT 1`);
    const table = res?.[0]?.values?.[0]?.[0] as string | undefined;
    if (!table) return [];
    const rows = db.exec(`SELECT * FROM ${table}`);
    if (!rows?.[0]) return [];
    const cols = rows[0].columns;
    return rows[0].values
      .map((vals: any[]) => {
        const o: Record<string, any> = {};
        vals.forEach((v, i) => (o[cols[i]] = v));
        return o;
      })
      .filter((r) => r.name)
      .map(normalizeRow);
  } finally {
    db.close();
  }
}

export async function loadDbExercises(): Promise<DbExercise[]> {
  if (_cache) return _cache;
  if (_loading) return _loading;
  _loading = (async () => {
    const resp = await fetch("/workout_exercises.db");
    if (!resp.ok) throw new Error("Failed to fetch workout_exercises.db");
    const buf = new Uint8Array(await resp.arrayBuffer());
    const list = await bestEffortRead(buf);
    _cache = list;
    return list;
  })();
  return _loading;
}

/** Idle warmup — safe no-op if already loaded */
export function warmLoadDbExercisesIdle() {
  const run = () => {
    if (_cache || _loading) return;
    // fire and forget
    loadDbExercises().catch(() => {});
  };
  // @ts-ignore
  const ric = window.requestIdleCallback as any;
  if (typeof ric === "function") ric(run, { timeout: 3000 });
  else setTimeout(run, 1200);
}
