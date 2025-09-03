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
npm run android:prep
npm run android:open
```
