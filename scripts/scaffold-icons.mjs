#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "icons");

// 1x1 transparent PNG (base64). Placeholder only.
const TRANSPARENT_PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax9qQAAAABJRU5ErkJggg==";

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writePng(filename, base64) {
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, Buffer.from(base64, "base64"));
  return file;
}

function main() {
  ensureDir(outDir);
  const f192 = writePng("icon-192.png", TRANSPARENT_PX);
  const f512 = writePng("icon-512.png", TRANSPARENT_PX);
  const fApple = writePng("apple-touch-icon.png", TRANSPARENT_PX);
  const f16 = writePng("icon-16.png", TRANSPARENT_PX);
  const f32 = writePng("icon-32.png", TRANSPARENT_PX);
  console.log(
    "Wrote placeholder icons:\n -",
    f16,
    "\n -",
    f32,
    "\n -",
    f192,
    "\n -",
    f512,
    "\n -",
    fApple
  );
  console.log(
    "Note: These are 1x1 placeholders. Replace with proper 192x192 and 512x512 PNGs."
  );
}

main();
