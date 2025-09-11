#!/usr/bin/env node
// Inspect an SQLite DB using sql.js and print basic metadata + samples
import fs from 'fs';
import path from 'path';

import initSqlJs from 'sql.js';

async function main() {
  const file = process.argv[2] || 'public/workout_exercises.db';
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  const bytes = fs.readFileSync(file);
  const db = new SQL.Database(new Uint8Array(bytes));

  function rows(query) {
    try {
      const res = db.exec(query);
      if (!res || !res[0]) return [];
      const cols = res[0].columns;
      return res[0].values.map(v => Object.fromEntries(v.map((x, i) => [cols[i], x])));
    } catch (e) {
      return [];
    }
  }

  const tables = rows("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name");
  console.log(JSON.stringify({ file, tables }, null, 2));

  for (const t of tables) {
    const tn = t.name;
    const info = rows(`PRAGMA table_info(${tn})`);
    const count = rows(`SELECT COUNT(*) AS n FROM ${tn}`)[0]?.n ?? 0;
    const sample = rows(`SELECT * FROM ${tn} LIMIT 3`);
    console.log('\n===', tn, `(${count} rows)`);
    console.log('columns:', info.map(c => `${c.name}:${c.type}`).join(', '));
    console.log('sample:', JSON.stringify(sample, null, 2));
  }

  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

