export function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 compliant UUID polyfill
  let uuid = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else if (i === 14) {
      uuid += "4";
    } else {
      const r = (Math.random() * 16) | 0;
      uuid += ((i === 19 ? (r & 0x3) | 0x8 : r)).toString(16);
    }
  }
  return uuid;
}
