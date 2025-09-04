#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public", "screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1x1 transparent png
const PX = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax9qQAAAABJRU5ErkJggg==";

function write(name) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, Buffer.from(PX, "base64"));
  console.log("Wrote", file);
}

write("desktop-1280x720.png");
write("mobile-1080x1920.png");

