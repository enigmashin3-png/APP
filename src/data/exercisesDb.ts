// Dynamic import so it never runs at module init
type InitSqlJs = (typeof import("sql.js"))["default"];
let _initSqlJs: InitSqlJs | null = null;

// @ts-ignore - Vite will rewrite ?url to an asset path
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type DbExercise = {
  id: string;
  name: string;
  primary: string;
  equipment: string[];
  description?: string;
  tags?: string[];
  gifUrl?: string;
  imageUrl?: string;
  images?: string[];
};

let _cache: DbExercise[] | null = null;
let _loading: Promise<DbExercise[]> | null = null;

function listish(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v)
    .split(/[,/;|]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeRow(row: Record<string, any>): DbExercise {
  return {
    id: String(row.id ?? row.slug ?? row.name),
    name: String(row.name),
    primary: String(row.primary ?? row.primary_muscle ?? row.muscle ?? "Other"),
    equipment: listish(row.equipment ?? row.equipments ?? row.equipment_list),
    description: row.description ?? row.instructions ?? row.notes ?? undefined,
    tags: listish(row.tags ?? row.tag_list),
    gifUrl: row.gif_url ?? row.gif ?? row.media_gif ?? undefined,
    imageUrl: row.image_url ?? row.image ?? row.thumbnail ?? undefined,
    images: listish(row.images ?? row.gallery),
  };
}

async function openDb(bytes: Uint8Array) {
  try {
    if (!_initSqlJs) {
      _initSqlJs = (await import("sql.js")).default;
    }
    const SQL = await _initSqlJs({ locateFile: () => wasmUrl });
    return new SQL.Database(bytes);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to init sql.js/wasm:", e);
    return null; // graceful fail
  }
}

async function queryAll(dbBytes: Uint8Array, q: string): Promise<Record<string, any>[]> {
  const db = await openDb(dbBytes);
  if (!db) return [];
  try {
    const res = db.exec(q);
    if (!res?.[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((vals: any[]) => {
      const o: Record<string, any> = {};
      vals.forEach((v, i) => (o[cols[i]] = v));
      return o;
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("DB query failed, trying next shape:", e);
    return [];
  } finally {
    db.close();
  }
}

async function bestEffortRead(dbBytes: Uint8Array): Promise<DbExercise[]> {
  const shapes = [
    `SELECT id, name, primary_muscle AS primary, equipment, description, tags, gif_url, image_url, images FROM exercises`,
    `SELECT id, name, muscle AS primary, equipment, description, tags, gif_url, image_url, images FROM exercises`,
    `SELECT id, name, primary AS primary, equipment, instructions AS description, tags FROM exercise`,
    `SELECT id, name, primary_muscle AS primary, equipment_list AS equipment, instructions AS description FROM exercise_library`,
    `SELECT name, description FROM exercises`,
  ];
  for (const q of shapes) {
    const rows = await queryAll(dbBytes, q);
    if (rows.length)
      return rows
        .filter((r) => r.name)
        .map(normalizeRow)
        .sort((a, b) => a.name.localeCompare(b.name));
  }
  return [];
}

export async function loadDbExercises(): Promise<DbExercise[]> {
  if (_cache) return _cache;
  if (_loading) return _loading;
  _loading = (async () => {
    try {
      // DB must live under /public
      const resp = await fetch("/workout_exercises.db");
      if (!resp.ok) throw new Error(`fetch workout_exercises.db: HTTP ${resp.status}`);
      const bytes = new Uint8Array(await resp.arrayBuffer());
      const list = await bestEffortRead(bytes);
      _cache = list;
      return list;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed loading exercises DB:", e);
      _cache = []; // don’t crash; UI will show “No matches” or error string
      return [];
    }
  })();
  return _loading;
}

// Idle warm load (safe no-op)
export function warmLoadDbExercisesIdle() {
  const run = () => {
    if (!_cache && !_loading) loadDbExercises().catch(() => {});
  };
  // @ts-ignore
  const ric = window.requestIdleCallback as any;
  if (typeof ric === "function") ric(run, { timeout: 3000 });
  else setTimeout(run, 1200);
}
