#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

async function ensureSharp() {
  try {
    await import("sharp");
    return (await import("sharp")).default;
  } catch {
    console.error("Missing 'sharp'. Install with: npm i -D sharp");
    process.exit(1);
  }
}

async function makeScreenshot(sharp, source, out, width, height) {
  const background = { r: 12, g: 15, b: 20, alpha: 1 };
  const canvas = sharp({ create: { width, height, channels: 4, background } });
  const logo = await sharp(source)
    .resize(Math.floor(width * 0.6), Math.floor(height * 0.6), {
      fit: "inside",
      withoutEnlargement: true,
      background,
    })
    .png()
    .toBuffer();
  await canvas
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("Wrote", out);
}

async function main() {
  const sharp = await ensureSharp();
  const root = process.cwd();
  const source = path.join(root, "public", "branding", "logo.png");
  if (!fs.existsSync(source)) {
    console.error("Source image not found:", source);
    process.exit(1);
  }
  const outDir = path.join(root, "public", "screenshots");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await makeScreenshot(sharp, source, path.join(outDir, "desktop-1280x720.png"), 1280, 720);
  await makeScreenshot(sharp, source, path.join(outDir, "mobile-1080x1920.png"), 1080, 1920);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

