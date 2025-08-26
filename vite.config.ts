import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Detect when building inside a Tauri environment so we can use a relative
// base path. The absolute "/" base causes a blank screen in the packaged app
// because asset URLs resolve to the filesystem root.
// Check for multiple Tauri-specific environment variables. Depending on the
// build step, either TAURI_PLATFORM or TAURI_ARCH may be provided. If any of
// them are present we assume a Tauri build and use a relative base path.
const isTauri = Boolean(
  process.env.TAURI_PLATFORM || process.env.TAURI_ARCH
);

export default defineConfig({
  plugins: [react()],
  // Use a relative base in Tauri builds to correctly load assets. For the web
  // dev server or browser builds we keep the default absolute base.
  base: isTauri ? "./" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    "process.env": {}, // prevent "process is not defined" in some libs
  },
  build: {
    target: "esnext", // for dynamic import of wasm initializers
  },
  server: {
    strictPort: true,
    port: 5173,
  },
});
