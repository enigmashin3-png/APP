/**
 * Single source of truth for the Lift Legends logo.
 *
 * CURRENT STATE:
 * - A 1×1 placeholder is used to keep Codex happy with text-only assets.
 * - Replace LOGO_DATA_URI below with your full base64-encoded PNG
 *   when you have it. (e.g., data:image/png;base64,iVBORw0K...)
 *
 * OPTIONAL RUNTIME OVERRIDE (no code changes needed):
 * - If /branding/logo.png exists in /public, the app will use that instead.
 *   (Place your real PNG at public/branding/logo.png, rebuild, and done.)
 */

export const LOGO_DATA_URI =
  // 1×1 transparent PNG (placeholder). Replace with your full base64 when ready.
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5a7dEAAAAASUVORK5CYII=";

/**
 * Compute the best logo URL to use.
 * 1) Try a real file in /public (public/branding/logo.png).
 * 2) Fallback to the embedded base64 placeholder above.
 */
export async function resolveLogoUrl(): Promise<string> {
  try {
    // Try a real file in /public (works in dev & prod if the file exists)
    const candidate = "/branding/logo.png";
    const res = await fetch(candidate, { method: "HEAD" });
    if (res.ok) return candidate;
  } catch {
    // Ignore network errors and fall back to placeholder
  }
  return LOGO_DATA_URI;
}
