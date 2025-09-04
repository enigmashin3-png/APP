#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sharpPath = path.join(root, "node_modules", "sharp");

async function ensureSharp() {
  try {
    await import("sharp");
    return;
  } catch {
    console.error("Missing 'sharp'. Install with: npm i -D sharp");
    process.exitCode = 1;
    throw new Error("sharp not installed");
  }
}

async function main() {
  await ensureSharp();
  const sharp = (await import("sharp")).default;

  const source = path.join(root, "public", "branding", "logo.png");
  if (!fs.existsSync(source)) {
    console.error("Source image not found:", source);
    console.error("Place your uploaded logo at public/branding/logo.png");
    process.exit(1);
  }

  const outDir = path.join(root, "public", "icons");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    { name: "icon-16.png", size: 16 },
    { name: "icon-32.png", size: 32 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "icon-192-maskable.png", size: 192 },
    { name: "icon-512-maskable.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
  ];

  for (const t of targets) {
    const out = path.join(outDir, t.name);
    const background = { r: 12, g: 15, b: 20, alpha: 1 };
    await sharp(source)
      .resize(Math.round(t.size * 0.86), Math.round(t.size * 0.86), {
        fit: "contain",
        withoutEnlargement: true,
        background,
      })
      .extend({
        top: Math.round(t.size * 0.07),
        bottom: Math.round(t.size * 0.07),
        left: Math.round(t.size * 0.07),
        right: Math.round(t.size * 0.07),
        background,
      })
      .resize(t.size, t.size, { fit: "cover", background })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log("Wrote", out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
