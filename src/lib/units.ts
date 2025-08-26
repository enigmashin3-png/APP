export type Unit = "kg" | "lb";
const KG_PER_LB = 0.45359237;
const LB_PER_KG = 1 / KG_PER_LB;

export function toUserUnits(kgValue: number, unit: Unit): number {
  return unit === "kg" ? kgValue : +(kgValue * LB_PER_KG).toFixed(1);
}
export function fromUserUnits(value: number, unit: Unit): number {
  return unit === "kg" ? value : +(value * KG_PER_LB).toFixed(2);
}
export function unitLabel(unit: Unit): "kg" | "lb" {
  return unit;
}
