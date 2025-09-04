# Lift Legends

Lift Legends is a cross-platform workout tracker with an AI coaching service. The app targets web, desktop (Tauri), and mobile (Capacitor) builds while sharing a single React/TypeScript codebase.

## Architecture overview

- App shell: Vite + React + TypeScript
- State: Zustand with persistence
- Data: `sql.js` reads `public/workout_exercises.db`
- Platforms: Web, Tauri desktop, and Capacitor mobile

## Repository layout

- `src/`: main React application source code
- `server/`: Express server (static + API)
- `docs/LiftTrackerAI/`: AI coach demo and related docs
- `apps/mobile/`: Capacitor (Android) setup
- `apps/desktop/src-tauri/`: Tauri desktop configuration
- `public/`: static assets (bundled SQLite database)

## Local development

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies with `npm install`.
3. Start the dev servers with `npm run dev`. This runs the Express server and the web client concurrently.
4. Optional: API is available at `/api/coach` (Express locally or `api/coach.ts` on Vercel).

## Environment variables

The application uses the following variables:

- `GROQ_API_KEY` — key for Groq API
- `GROQ_MODEL` — model name for AI interactions
- `PORT` — port used by the development server

## Build steps

- `npm run check` — typecheck and lint the project
- `npm run build` — build the web client and TypeScript sources
- `npm start` — serve the built client with the Express server

## Deployment

The repository contains a `render.yaml` for deploying to Render. The service installs dependencies, runs the build, and starts the server:

```
buildCommand: npm install && npm run build
startCommand: npm start
```

Ensure production environment variables such as `PORT` are set in your hosting environment.

## Mobile (Capacitor) quickstart
1. `npm i -D @capacitor/cli && npm i @capacitor/core`
2. `npx cap init "Lift Legends" "com.liftlegends.app"`
3. `npm run build && npx cap add android && npx cap copy`
4. Set icon/splash from the base64 logo (convert to PNG) in `android/app/src/main/res/`.
5. Use `@capacitor/preferences` for storage persistence.

## Desktop (Tauri) quickstart
1. `npm i -D @tauri-apps/cli @tauri-apps/api`
2. `npx tauri init` (use dist folder as bundle target)
3. `npm run build && npx tauri build`

## E2E tests (Playwright)
Run locally:

```bash
npm run dev   # in one terminal
npm run test:e2e
```

In CI, Playwright installs browsers and runs via the workflow.

## Production API on Vercel
This repo includes a serverless function at `api/coach.ts`. On Vercel, your frontend runs as static assets and `/api/coach` proxies AI requests using `GROQ_API_KEY`. Locally, the Express server also exposes `/api/coach` for development parity.

