# Lift Legends

Lift Legends is a cross-platform workout tracker with an AI coaching service. The app targets web, desktop (Tauri), and mobile (Capacitor) from a single React/TypeScript codebase.

## Architecture

- App shell: Vite + React + TypeScript
- State: Zustand with persistence
- Data: `sql.js` reads `public/workout_exercises.db`
- API: Vercel serverless function at `api/coach.ts` (production and dev)
- Optional server: Express app (`server/index.js`) for serving built assets locally or in non-Vercel environments

## Layout

- `src/` – React application
- `api/` – Vercel serverless functions
- `server/` – Express app (no API routes; static + SPA fallback)
- `apps/` – Native shells (Tauri + Capacitor)
- `public/` – static assets (icons, screenshots, SQLite DB)

## Local development

1. Copy `.env.example` to `.env` and set values.
2. `npm install`.
3. `npm run dev`.
   - Runs `vercel dev` on `http://localhost:3000` for serverless functions.
   - Runs Vite on `http://localhost:5173`; Vite proxies `/api/*` to `:3000`.

API is available at `/api/coach` in both dev and production.

## Environment variables

- `GROQ_API_KEY` – Groq API key
- `GROQ_MODEL` – default model
- `GROQ_ALLOWED_MODELS` – comma-separated allowlist
- `COACH_MAX_MESSAGES`, `COACH_MAX_CONTENT_LEN`, `COACH_RPM` – validation and rate limits
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` – optional distributed rate limiting

## Build and preview

- `npm run check` – typecheck + lint
- `npm run build` – build the web client
- `npm run preview` – serve built assets via Vite preview

The Express app (`server/index.js`) can also serve `dist/` if you prefer a Node server.

## Deployment (Vercel)

- Static build with `@vercel/static-build` is configured via `vercel.json`.
- `/api/*` routes are preserved by rewrites.
- Push to `main` to deploy or use `vercel --prod`.

## Mobile (Capacitor)
1. `npm run build`
2. `cd apps/mobile && npx cap sync && npx cap open android`

## Desktop (Tauri)
1. `npm run build`
2. `cd apps/desktop && npx tauri build`

## E2E tests (Playwright)

Run locally:

```bash
npm run dev   # one terminal
npm run test:e2e
```

CI runs unit/integration tests and a repo verifier.

## Assets

Icons and screenshots are generated from `public/branding/logo.png` using:

```bash
npm run assets:from-logo
```

