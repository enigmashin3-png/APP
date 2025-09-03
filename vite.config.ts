import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  if (mode !== "test") {
    try {
      const { VitePWA } = await import("vite-plugin-pwa");
      plugins.push(
        VitePWA({
          registerType: "autoUpdate",
          manifest: {
            name: "Lift Legends",
            short_name: "LiftLegends",
            start_url: "/",
            display: "standalone",
            background_color: "#0C0F14",
            theme_color: "#D8B24D",
            icons: [
              // Upload these real files later under public/icons/ to enable proper PWA install banners
              { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
          },
        })
      );
    } catch (err) {
      // Optional dependency not installed; continue without PWA support
    }
  }
  return {
    plugins,
    test: {
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      globals: true,
      exclude: [...configDefaults.exclude, "LiftTrackerAI/**"],
    },
  };
});
