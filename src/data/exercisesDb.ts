import initSqlJs from "sql.js";
// Vite resolves ?url to a proper asset path for the wasm file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type DbExercise = {
  id: string;
  name: string;
  primary: string;
  equipment: string[];
  description?: string;
  tags?: string[];
};

let _cache: DbExercise[] | null = null;
let _loading: Promise<DbExercise[]> | null = null;

function normalizeRow(row: Record<string, any>): DbExercise {
  const equipmentRaw = row.equipment ?? row.equipments ?? row.equipment_list ?? "";
  const tagsRaw = row.tags ?? row.tag_list ?? "";

  const equipment =
    Array.isArray(equipmentRaw)
      ? equipmentRaw
      : String(equipmentRaw || "")
          .split(/[,/]/)
          .map((s) => s.trim())
          .filter(Boolean);

  const tags =
    Array.isArray(tagsRaw)
      ? tagsRaw
      : String(tagsRaw || "")
          .split(/[,/]/)
          .map((s) => s.trim())
          .filter(Boolean);

  return {
    id: String(row.id ?? row.slug ?? row.name),
    name: String(row.name),
    primary: String(row.primary ?? row.primary_muscle ?? row.muscle ?? "Other"),
    equipment,
    description: row.description ?? row.instructions ?? row.notes ?? undefined,
    tags,
  };
}

async function queryAll(sql: any, dbBytes: Uint8Array, q: string): Promise<Record<string, any>[]> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database(dbBytes);
  try {
    const res = db.exec(q);
    if (!res || !res[0]) return [];
    const cols = res[0].columns;
    return res[0].values.map((arr: any[]) => {
      const o: Record<string, any> = {};
      arr.forEach((v, i) => (o[cols[i]] = v));
      return o;
    });
  } finally {
    db.close();
  }
}

/** Attempts multiple common schemas to find exercises */
async function bestEffortRead(dbBytes: Uint8Array): Promise<DbExercise[]> {
  const candidates = [
    // most likely
    `SELECT id, name, primary_muscle AS primary, equipment, description, tags FROM exercises`,
    `SELECT id, name, muscle AS primary, equipment, description, tags FROM exercises`,
    `SELECT id, name, primary AS primary, equipment, description, tags FROM exercises`,
    // other table names
    `SELECT id, name, muscle AS primary, equipment, instructions AS description, tags FROM exercise`,
    `SELECT id, name, primary_muscle AS primary, equipment_list AS equipment, instructions AS description FROM exercise_library`,
    // very generic fallback: pick any table that has name+description
    `SELECT name, description FROM exercises`,
  ];

  for (const q of candidates) {
    try {
      const rows = await queryAll(null, dbBytes, q);
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

  // one last fallback: introspect sqlite_master and try first table
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database(dbBytes);
  try {
    const master = db.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name LIMIT 1`);
    if (master[0]?.values?.[0]?.[0]) {
      const table = master[0].values[0][0] as string;
      const rows = db.exec(`SELECT * FROM ${table} LIMIT 1000`);
      if (rows[0]) {
        const cols = rows[0].columns;
        const nameIdx = cols.findIndex((c) => /name/i.test(c));
        if (nameIdx >= 0) {
          return rows[0].values
            .map((arr: any[]) => {
              const obj: Record<string, any> = {};
              arr.forEach((v, i) => (obj[cols[i]] = v));
              return obj;
            })
            .filter((r) => r.name)
            .map(normalizeRow);
        }
      }
    }
  } finally {
    db.close();
  }

  return [];
}

/** Public loader (cached). Fetches /workout_exercises.db and reads rows. */
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

