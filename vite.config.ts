import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "/",
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
