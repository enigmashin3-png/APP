import { Capacitor } from "@capacitor/core";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function isCapacitorNative(): boolean {
  try {
    return Capacitor?.isNativePlatform?.() ?? false;
  } catch {
    return false;
  }
}
