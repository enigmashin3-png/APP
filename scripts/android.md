# Android Build & Test – Lift Legends

## Icons & Splash (files required, not base64)
Place real PNGs (not base64) before generating:
- `resources/branding/icon.png`   (square, large; e.g., 1024×1024)
- `resources/branding/splash.png` (portrait; e.g., 1080×1920)

Generate assets:
```bash
npx capacitor-assets generate --android \
  --icon resources/branding/icon.png \
  --splash resources/branding/splash.png \
  --iconBackgroundColor "#0C0F14"
```

## Run on emulator/device
```bash
# Build web bundle and sync to native project
npm run android:sync

# Open Android Studio project
npm run android:open
```

You can also run the Gradle task from Android Studio:

- Gradle panel → Tasks → capacitor → capSyncAndroid
- This runs `npm run android:sync` at the repo root.

## Debug networking

- Debug builds allow cleartext HTTP and include a permissive network security config for local dev.
- Connect to Vite/preview or local APIs via `http://10.0.2.2:<port>` (emulator) or your LAN IP.
- This does not affect Release builds.

## Hardware back button

- The app listens for the Android back button via `@capacitor/app`.
- Behavior: navigate back if possible; otherwise exit the app.

## Deep links

- Custom scheme is enabled: `com.lift.legends://...` opens the app.
- Adjust host-based App Links later by adding an HTTPS intent-filter when you have a domain.

## Android Studio tips

- Use JDK 17: Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK: "Embedded JDK 17" or a local JDK 17.
- After pulling JS plugin changes (e.g., adding `@capacitor/app`), run: `npm install && npx cap sync android`.
- If build fails with missing web assets, run: `npm run build && npx cap sync android` and re-sync Gradle.
- Gradle is tuned for Studio: Java 17 compile options, parallel + caching enabled in `android/gradle.properties`.
