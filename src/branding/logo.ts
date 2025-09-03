/**
 * Central logo reference for Lift Legends.
 * CURRENT: a 1×1 placeholder. Replace LOGO_DATA_URI with your full base64 PNG when ready.
 * RUNTIME FALLBACK: If /public/branding/logo.png exists, the app uses it automatically.
 */
export const LOGO_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5a7dEAAAAASUVORK5CYII="; // 1x1 transparent PNG

export async function resolveLogoUrl(): Promise<string> {
    try {
      const candidate = "/branding/logo.png";
      const res = await fetch(candidate, { method: "HEAD" });
      if (res.ok) return candidate;
    } catch {
      /* ignore */
    }
  return LOGO_DATA_URI;
}
