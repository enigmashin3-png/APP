Place your app logo as a PNG here:

- File: `public/branding/logo.png`
- Recommended: square, 1024x1024 or larger
- Transparent background preferred

After adding `logo.png`, you can generate install icons and screenshots used by the PWA and docs:

```
npm i
npm run assets:from-logo
```

Android app icons and splash are generated via `capacitor-assets` (requires separate, high-res images):

```
# Place your source files (do not reuse the small web icon)
resources/branding/icon.png   # 1024x1024 square
resources/branding/splash.png # e.g., 1080x1920 portrait

npx capacitor-assets generate --android \
  --icon resources/branding/icon.png \
  --splash resources/branding/splash.png \
  --iconBackgroundColor "#0C0F14"
```

The in-app brand component automatically uses `/branding/logo.png` if it exists; otherwise it falls back to a tiny placeholder.

