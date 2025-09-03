import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";
import { LOGO_DATA_URI } from "./src/branding/logo";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  pwa: {
    manifest: {
      icons: [
        { src: LOGO_DATA_URI, sizes: "192x192", type: "image/png" },
        { src: LOGO_DATA_URI, sizes: "512x512", type: "image/png" },
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
