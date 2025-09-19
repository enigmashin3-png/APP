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

### Android App Links (HTTPS)

1. Replace `example.com` with your domain in `android/app/src/main/AndroidManifest.xml:1` under the HTTPS intent-filter.
2. Host `public/.well-known/assetlinks.json` at `https://<your-domain>/.well-known/assetlinks.json`.
   - Update `package_name` if needed (current: `com.lift.legends`).
   - Replace `REPLACE_WITH_SHA256_CERT_FINGERPRINT` with your release signing cert fingerprint. If using Play App Signing, use the Play-provided SHA256 certificate.
3. Rebuild and install the app, then visit an HTTPS link on your domain to verify auto-verification (`autoVerify=true`).

Tip: You can get the keystore fingerprint via:
```bash
keytool -list -v -keystore /path/to/your.keystore -alias <alias> -storepass <pass> -keypass <pass>
```

## Android Studio tips

- Use JDK 17: Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK: "Embedded JDK 17" or a local JDK 17.
- After pulling JS plugin changes (e.g., adding `@capacitor/app`), run: `npm install && npx cap sync android`.
- If build fails with missing web assets, run: `npm run build && npx cap sync android` and re-sync Gradle.
- Gradle is tuned for Studio: Java 17 compile options, parallel + caching enabled in `android/gradle.properties`.

### Status bar & keyboard

- Plugins included: `@capacitor/status-bar`, `@capacitor/keyboard`.
- The app sets a dark background and light status bar text, and uses native keyboard resize (`adjustResize`).
- If plugins are out of sync, run: `npm install && npx cap sync android`.

### Release signing (env-driven)

- Configure environment variables before building a signed release:
  - `ANDROID_SIGNING_KEYSTORE` – absolute path to keystore
  - `ANDROID_SIGNING_STORE_PASSWORD` – keystore password
  - `ANDROID_SIGNING_KEY_ALIAS` – key alias
  - `ANDROID_SIGNING_KEY_PASSWORD` – key password
- If not set, the build produces an unsigned release APK/AAB (for Play, a signed build is required).

### Native build PWA gating

- Native builds set `BUILD_TARGET=native` (via `npm run android:sync`) to skip PWA service worker for the embedded WebView.
