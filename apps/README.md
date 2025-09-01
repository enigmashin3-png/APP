# Platform Wrappers

This directory contains native wrappers for shipping the web client on desktop (Tauri) and mobile (Capacitor).
Both wrappers load the compiled frontend from `../dist`, produced by the root `npm run build`.

> The GitHub workflow `ci-build` (`.github/workflows/ci-build.yaml`) fails if any `dist/` files are committed, keeping build artifacts out of git.

## Desktop (Tauri)

1. Run `npm run build` at the repository root to generate `dist/`.
2. Install Rust and the Tauri CLI (`cargo install tauri-cli`) if needed.
3. `cd apps/desktop`.
4. Package the app with `npx tauri build` (use `npx tauri dev` during development).

The Tauri configuration (`apps/desktop/src-tauri/tauri.conf.json`) points `distDir` to `../dist`, so the native shell packages the Vite build.

## Mobile (Capacitor)

1. Run `npm run build` at the repository root.
2. Install Android Studio/SDK/Java 17 and the Capacitor CLI (`npm install @capacitor/cli @capacitor/android`).
3. `cd apps/mobile`.
4. Copy the built assets with `npx cap sync`.
5. Open the project in Android Studio using `npx cap open android` and build your APK/AAB.

`capacitor.config.ts` sets `webDir` to `../dist`, so the mobile wrapper ships the compiled web assets.
