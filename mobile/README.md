# Mobile/Desktop Build Notes

## Android (Capacitor)
1) Install tools: Android Studio, SDK, Java 17.
2) Install deps: `npm i @capacitor/core @capacitor/cli @capacitor/android`
3) Init Capacitor (once): `npx cap init "Lift Legends" com.lift.legends`
4) Build web: `npm run build`
5) Add android: `npx cap add android`
6) Sync assets: `npx cap sync`
7) Open Android Studio: `npx cap open android` → build APK/AAB.

`capacitor.config.ts` should point `webDir` to your build output (e.g., "dist").

## Windows (Tauri)
1) Install Rust + tauri-cli (`cargo install tauri-cli`).
2) Init: `npx tauri init` and choose your build folder (e.g., `dist`).
3) Dev: `npm run tauri:dev`
4) Build: `npm run tauri:build`

In production, set `VITE_COACH_URL` to your hosted API (so the app calls your deployed /api/coach).
