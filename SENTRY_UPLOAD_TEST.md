This file exists to create a trivial change for testing Sentry sourcemap uploads.

Actions:
- Ensure Sentry env vars are set in CI or Vercel (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`).
- Build: `npm run build`. The `@sentry/vite-plugin` uploads sourcemaps when envs are present.

