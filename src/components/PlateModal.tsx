import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { planPlates } from "../utils/plates";
import { fromUserUnits, toUserUnits, unitLabel } from "../lib/units";
import { useWorkoutStore } from "../store/workout";

export default function PlateModal({
  open, onClose, initialTarget
}: { open: boolean; onClose: () => void; initialTarget?: number }) {
  const settings = useWorkoutStore((s) => s.settings);
  const unit = settings.unit;
  const [target, setTarget] = useState<number>(initialTarget ?? 60);
  const [bar, setBar] = useState<number>(unit === "kg" ? (settings.barWeightKg ?? 20) : 45);
  const [avail, setAvail] = useState<string>(unit === "kg" ? "25,20,15,10,5,2.5,1.25" : "45,35,25,10,5,2.5");

  useEffect(() => {
    if (open) setTarget(initialTarget ?? target);
  }, [open, initialTarget]);

  const plan = useMemo(() => {
    const totalKg = fromUserUnits(target, unit);
    const barKg = fromUserUnits(bar, unit);
    const availableKg = avail.split(",").map((x) => Number(x.trim())).filter(Boolean).map((x) => fromUserUnits(x, unit));
    return planPlates(totalKg, barKg, availableKg);
  }, [target, bar, avail, unit]);

  return (
    <Modal open={open} onClose={onClose} title="Plate Calculator">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          <label className="space-y-1">
            <div className="text-sm">Target ({unitLabel(unit)})</div>
            <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value || 0))}
              className="h-10 w-full rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
          </label>
          <label className="space-y-1">
            <div className="text-sm">Bar ({unitLabel(unit)})</div>
            <input type="number" value={bar} onChange={(e) => setBar(Number(e.target.value || 0))}
              className="h-10 w-full rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
          </label>
          <label className="space-y-1 sm:col-span-3">
            <div className="text-sm">Available plates (comma separated, {unitLabel(unit)})</div>
            <input value={avail} onChange={(e) => setAvail(e.target.value)}
              className="h-10 w-full rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
          </label>
        </div>

        <div className="rounded-xl border p-3 border-neutral-200 dark:border-neutral-800">
          <div className="text-sm opacity-70 mb-2">Per side</div>
          <div className="flex flex-wrap gap-2">
            {plan.perSide.length === 0 ? <span className="text-sm opacity-70">None</span> :
              plan.perSide.map((p, i) => (
                <span key={i} className="text-sm rounded-full border px-2 py-0.5 border-neutral-300 dark:border-neutral-700">
                  {toUserUnits(p, unit)} {unitLabel(unit)}
                </span>
              ))}
          </div>
          {plan.remainder > 0.001 && (
            <div className="mt-2 text-xs opacity-70">
              Remainder per side: {toUserUnits(plan.remainder, unit)} {unitLabel(unit)}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black">Close</button>
        </div>
      </div>
    </Modal>
  );
}
