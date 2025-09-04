#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const read = (p) => {
  try {
    return fs.readFileSync(path.join(root, p), "utf8");
  } catch {
    return null;
  }
};
const json = (p) => {
  const t = read(p);
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
};

const pkg = json("package.json");
const tsconfig = json("tsconfig.json");
const viteCfg = read("vite.config.ts") || read("vite.config.js");
const vercel = json("vercel.json");
const hasPlaywright = !!(pkg?.devDependencies?.["@playwright/test"]);
const hasRouter = !!(pkg?.dependencies?.["react-router-dom"]);
const scripts = pkg?.scripts || {};

const checks = [];
function check(label, ok, extra = "") {
  checks.push({ label, ok, extra });
}

check("package.json present", !!pkg);
check("vite config present", !!viteCfg);
check("TypeScript paths set (@/*)", !!tsconfig?.compilerOptions?.paths?.["@/*"]);
check("Vite tsconfig paths plugin in devDependencies", !!pkg?.devDependencies?.["vite-tsconfig-paths"]);
check("`vercel.json` present with static-build", !!(vercel && vercel.builds?.some(b => b.use === "@vercel/static-build")));
check("`vercel-build` script defined", typeof scripts["vercel-build"] === "string");
check("Express start script (`start`) present", typeof scripts["start"] === "string");
check("Dev script runs server + vite (`dev`)", /vite/.test(scripts["dev"]||"") && /node/.test(scripts["dev"]||""));
check("Playwright installed", hasPlaywright);
check("E2E scripts present", typeof scripts["test:e2e"] === "string");
check("Router installed (react-router-dom)", hasRouter);
check("Appearance screen exists", fs.existsSync(path.join(root, "src/screens/SettingsAppearance.tsx")));
check("Log screen exists", fs.existsSync(path.join(root, "src/screens/LogWorkout.tsx")));
check("App routes present", fs.existsSync(path.join(root, "src/AppRoutes.tsx")));
check("Favicon setter present", fs.existsSync(path.join(root, "src/set-favicon.ts")));
check("Server ESM entry exists", fs.existsSync(path.join(root, "server/index.mjs")));
check("Coach API (serverless or server) exists",
  fs.existsSync(path.join(root, "api/coach.ts")) || fs.existsSync(path.join(root, "server/coach.mjs"))
);

const missing = checks.filter(c => !c.ok);
const pad = (s, n=40) => (s + " ".repeat(n)).slice(0, n);
console.log("\n=== Lift Legends Repo Verifier ===\n");
for (const c of checks) {
  console.log(`${pad(c.label)} ${c.ok ? "✅" : "❌"} ${c.ok ? "" : (c.extra||"")}`);
}
console.log("\nSummary:", missing.length === 0 ? "All good ✅" : `${missing.length} issues ❌`);
if (missing.length) {
  console.log("\nFix Hints:");
  for (const m of missing) {
    switch (m.label) {
      case "TypeScript paths set (@/*)":
        console.log("- Add to tsconfig.json -> compilerOptions.paths: { \"@/*\": [\"src/*\"] }");
        break;
      case "Vite tsconfig paths plugin in devDependencies":
        console.log("- npm i -D vite-tsconfig-paths && add plugin to vite.config.ts");
        break;
      case "`vercel.json` present with static-build":
        console.log("- Create vercel.json with @vercel/static-build and routes fallback to /index.html");
        break;
      case "`vercel-build` script defined":
        console.log("- Add scripts: { \"vercel-build\": \"vite build\" } to package.json");
        break;
      case "Router installed (react-router-dom)":
        console.log("- npm i react-router-dom and mount <BrowserRouter> in src/main.tsx");
        break;
      default:
        // generic hint
        console.log(`- Ensure file/script exists: ${m.label}`);
    }
  }
}
console.log("\nTip: If Codex showed 'no diffs available', it likely means these items already exist or files differ from expected contexts.\n");

