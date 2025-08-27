# Lift Legends

Lift Legends is a cross-platform workout tracker with an AI coaching service. The app targets web, desktop (Tauri), and mobile (Capacitor) builds while sharing a single React/TypeScript codebase.

## Architecture overview
- **App shell**: Vite + React + TypeScript
- **State**: Zustand with persistence
- **Data**: `sql.js` reads `public/workout_exercises.db`
- **Platforms**: Web, Tauri desktop, and Capacitor mobile

## Repository layout
- `src/` – main React application source code
- `server/` – minimal Express server that serves the production build
- `LiftTrackerAI/` – AI coach microservice and related client/docs
- `mobile/` – notes for Android (Capacitor) and Windows (Tauri) builds
- `src-tauri/` – Tauri configuration for desktop packaging
- `public/` – static assets such as the bundled SQLite database

## Local development
1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies with `npm install`.
3. Start the dev servers with `npm run dev`. This runs the Express server and the web client concurrently.
4. (Optional) start the AI coach service with `npm run dev:coach`.

## Environment variables
The application uses the following variables:
- `GROQ_API_KEY` – key for Groq API
- `GROQ_MODEL` – model name for AI interactions
- `PORT` – port used by the development server

## Build steps
- `npm run check` – typecheck and lint the project
- `npm run build` – build the web client and TypeScript sources
- `npm start` – serve the built client with the Express server

## Deployment
The repository contains a `render.yaml` for deploying to Render. The service installs dependencies, runs the build, and starts the server:
```
buildCommand: npm install && npm run build
startCommand: npm start
```
Ensure production environment variables such as `PORT` are set in your hosting environment.
