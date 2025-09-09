import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";
// Optional Sentry sourcemap upload during build
let sentryVitePlugin: ((opts: Record<string, unknown>) => unknown) | undefined;
try {
  sentryVitePlugin = (await import("@sentry/vite-plugin")).sentryVitePlugin;
} catch (_err) {
  // Sentry plugin is optional in local/dev environments
}

export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tsconfigPaths()];
  if (mode !== "test") {
    try {
      const { VitePWA } = await import("vite-plugin-pwa");
      plugins.push(
        VitePWA({
          registerType: "autoUpdate",
          includeAssets: [
            "/icons/icon-16.png",
            "/icons/icon-32.png",
            "/icons/apple-touch-icon.png",
            "/offline.html",
          ],
          workbox: {
            navigateFallback: "/offline.html",
            navigateFallbackDenylist: [/^\/api\//],
            runtimeCaching: [
              {
                // Never cache API calls
                urlPattern: /^\/api\//,
                handler: "NetworkOnly",
              },
              {
                // App shell assets
                urlPattern: ({ request }) => ["style", "script", "worker"].includes(request.destination),
                handler: "StaleWhileRevalidate",
                options: {
                  cacheName: "app-shell",
                },
              },
              {
                // Fonts
                urlPattern: ({ request }) => request.destination === "font",
                handler: "CacheFirst",
                options: {
                  cacheName: "fonts",
                  expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
              },
              {
                // Images and icons
                urlPattern: ({ request, url }) => request.destination === "image" || url.pathname.startsWith("/icons/"),
                handler: "CacheFirst",
                options: {
                  cacheName: "images",
                  expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
              },
            ],
          },
          // Localized manifests for future i18n (browsers ignore unknown fields)
          localize: [
            {
              locale: "en-US",
              manifest: {
                name: "Lift Legends",
                short_name: "LiftLegends",
                description:
                  "Lift Legends - log workouts, track PRs, browse exercises, and get AI coaching to progress faster.",
              },
            },
            {
              locale: "es-ES",
              manifest: {
                name: "Lift Legends",
                short_name: "LiftLegends",
                description:
                  "Lift Legends - registra entrenamientos, controla records, explora ejercicios y recibe coaching de IA.",
              },
            },
          ],
          manifest: {
            name: "Lift Legends",
            short_name: "LiftLegends",
            description:
              "Lift Legends - log workouts, track PRs, browse exercises, and get AI coaching to progress faster.",
            lang: "en-US",
            dir: "ltr",
            start_url: "/",
            scope: "/",
            display: "standalone",
            display_override: ["standalone", "browser"],
            orientation: "portrait",
            background_color: "#0C0F14",
            theme_color: "#D8B24D",
            categories: ["fitness", "health", "sports", "productivity"],
            icons: [
              { src: "/icons/icon-16.png", sizes: "16x16", type: "image/png", purpose: "any" },
              { src: "/icons/icon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
              { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
              { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
              { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
              { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
            ],
            shortcuts: [
              {
                name: "Start Workout",
                short_name: "Workout",
                url: "/workout",
                icons: [
                  {
                    src: "/icons/icon-192-maskable.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "maskable",
                  },
                ],
              },
              {
                name: "History",
                short_name: "History",
                url: "/history",
                icons: [
                  {
                    src: "/icons/icon-192-maskable.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "maskable",
                  },
                ],
              },
              {
                name: "Exercises",
                short_name: "Exercises",
                url: "/exercises",
                icons: [
                  {
                    src: "/icons/icon-192-maskable.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "maskable",
                  },
                ],
              },
            ],
            screenshots: [
              {
                src: "/screenshots/desktop-1280x720.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide",
              },
              {
                src: "/screenshots/mobile-1080x1920.png",
                sizes: "1080x1920",
                type: "image/png",
                form_factor: "narrow",
              },
            ],
            prefer_related_applications: false,
            related_applications: [
              {
                platform: "play",
                url: "https://play.google.com/store/apps/details?id=com.liftlegends.app",
                id: "com.liftlegends.app",
              },
              {
                platform: "itunes",
                url: "https://apps.apple.com/app/id000000000",
                id: "000000000",
              },
            ],
          },
        })
      );
      // Add Sentry plugin if env is configured
      const hasSentry = !!(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && sentryVitePlugin);
      if (hasSentry) {
        const release =
          process.env.SENTRY_RELEASE ||
          process.env.VERCEL_GIT_COMMIT_SHA ||
          process.env.GITHUB_SHA ||
          `local-${Date.now()}`;
        plugins.push(
          sentryVitePlugin({
            org: process.env.SENTRY_ORG!,
            project: process.env.SENTRY_PROJECT!,
            authToken: process.env.SENTRY_AUTH_TOKEN!,
            release,
            sourcemaps: { assets: "./dist/**" },
            telemetry: false,
          })
        );
      }
    } catch (err) {
      // Optional dependency not installed; continue without PWA support
    }
  }
  return {
    plugins,
    server: {
      proxy: {
        "/api/coach": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      globals: true,
      exclude: [...configDefaults.exclude, "LiftTrackerAI/**", "tests/e2e/**"],
    },
  };
});
