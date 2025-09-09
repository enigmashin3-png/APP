# Repo State & Diagnostics

Use this file when Codex says "no diffs available."

## Why that happens
- The exact patch already exists in the repo.
- Files differ slightly (spacing/quotes/ordering) so patch contexts don't match.
- You're on a different branch than expected.

## Quick checks
1. Run:
   ```bash
   node scripts/verify.mjs
   ```
   You'll get a checklist of the key pieces we touched.
2. If items are ?, tell me which ones failed and I'll generate a targeted, idempotent patch.

## CI
The verifier also runs in CI (see workflow). A failing step means something is missing or drifted.