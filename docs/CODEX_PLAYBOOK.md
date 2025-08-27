# Codex Playbook (Lift Legends)

## Branching
- Feature: `feat/<short-name>`
- Fix: `fix/<short-name>`
- Chore/infra: `chore/<short-name>`

## Commit style
Use Conventional-like messages: `feat(...)`, `fix(...)`, `chore(...)`, etc.

## Patch format
Prefer this structure for patches:
1. `git checkout -b <branch>`
2. One or more `applypatch << 'PATCH'` blocks
3. `git add -A && git commit -m "<summary>"`
4. `npm run check` (typecheck + lint)
5. `npm run build`

## File layout anchors
- `src/components/` — dumb/presentational components
- `src/pages/` — route-level pages
- `src/store/` — zustand store and slices
- `src/utils/` — pure utilities (unit tested first)
- `src/lib/` — platform bindings (tauri/capacitor/theme/units)
- `src/data/` — DB access/loaders (sql.js), constants
- `src/hooks/` — React hooks only (no side effects at import time)
- `src/targets/` — platform-specific UI (e.g., `tauri/Titlebar.tsx`)

## Guardrails
- No side effects at module top-level (avoid crashes on import).
- All new utils must be pure and unit-testable.
- DB/network calls must be lazy (triggered in `useEffect` or handlers).

## PR checklist
- Screenshots for UI touches
- No ESLint errors, `npm run check` passes
- No breaking changes to exported types without note in PR
