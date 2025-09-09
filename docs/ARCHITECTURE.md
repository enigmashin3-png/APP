# Architecture Overview

App shell: Vite + React + TypeScript
State: Zustand (persisted)
Data: `sql.js` reading `public/workout_exercises.db`
Platforms: Web, Tauri (desktop), Capacitor (mobile)

## Directories

- `src/components/`: reusable UI pieces
- `src/pages/`: routed pages
- `src/store/`: app state (persist + actions)
- `src/lib/`: platform/theme/units helpers
- `src/utils/`: pure functions (stats, prs, history)
- `src/data/`: DB loaders, data mappers
- `src/hooks/`: composition logic (e.g., `useDbExercises`)
- `src/targets/`: platform-specific UI chrome
- `public/`: static assets (`workout_exercises.db`)

## Build

- `npm run check` – typecheck + lint
- `npm run build` – production bundle
- GitHub Actions runs on every PR

