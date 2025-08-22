/**
 * COACH_URL resolver:
 * - Use VITE_COACH_URL if set (production/staging).
 * - Android emulator: 10.0.2.2
 * - LAN/dev: window.location.origin (if available)
 * - Tauri: assume local server on 127.0.0.1:8080 unless overridden
 */
const fromEnv = import.meta?.env?.VITE_COACH_URL || globalThis?.VITE_COACH_URL;
function detectDefault() {
    // Capacitor emulator
    const isAndroidEmu = typeof navigator !== "undefined" &&
        /Android/i.test(navigator.userAgent) &&
        (location.hostname === "10.0.2.2" || location.hostname === "localhost");
    if (isAndroidEmu)
        return "http://10.0.2.2:8080/api/coach";
    // Tauri environment flag
    const isTauri = typeof window.__TAURI__ !== "undefined";
    if (isTauri)
        return "http://127.0.0.1:8080/api/coach";
    // Browser/webview default
    if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}/api/coach`;
    }
    return "http://localhost:8080/api/coach";
}
export const COACH_URL = (fromEnv && String(fromEnv).trim()) || detectDefault();
