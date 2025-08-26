export type PlatePlan = { perSide: number[]; remainder: number };

export function planPlates(totalKg: number, barKg: number, availableKg: number[]): PlatePlan {
  const perSideTarget = (totalKg - barKg) / 2;
  if (perSideTarget <= 0) return { perSide: [], remainder: perSideTarget };
  const plates = [...availableKg].sort((a, b) => b - a);
  const out: number[] = [];
  let rem = perSideTarget;
  for (const p of plates) {
    while (rem >= p - 1e-6) {
      out.push(p);
      rem = +(rem - p).toFixed(3);
    }
  }
  return { perSide: out, remainder: +rem.toFixed(3) };
}
