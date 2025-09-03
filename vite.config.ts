import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";
import logoPng from "./src/assets/lift-legends-logo";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  pwa: {
    manifest: {
      icons: [
        { src: logoPng, sizes: "192x192", type: "image/png" },
        { src: logoPng, sizes: "512x512", type: "image/png" },
      ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    exclude: [...configDefaults.exclude, "LiftTrackerAI/**"],
  },
});
