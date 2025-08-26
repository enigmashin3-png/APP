import { useState } from "react";
import { useWorkoutStore } from "../store/workout";
import { isVoiceSupported, startDictation, parseWeightReps } from "../utils/voice";
import { fromUserUnits, unitLabel } from "../lib/units";
import PlateModal from "./PlateModal";
import { hapticTap } from "../lib/haptics";

type Props = { exId: string; setId: string };

export default function SetRow({ exId, setId }: Props) {
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const unit = useWorkoutStore((s) => s.settings.unit);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [listening, setListening] = useState(false);
  const [openPlates, setOpenPlates] = useState(false);

  const onVoice = () => {
    if (!isVoiceSupported()) return alert("Voice input not supported in this browser.");
    setListening(true);
    startDictation((text) => {
      const { weight: w, reps: r } = parseWeightReps(text);
      if (w) setWeight(String(w));
      if (r) setReps(String(r));
    }, () => setListening(false));
  };

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-2 items-center">
      <input inputMode="decimal" placeholder={unitLabel(unit)} value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
      <input inputMode="numeric" placeholder="reps" value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
      <input inputMode="decimal" placeholder="RPE" value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
      <button onClick={onVoice} title="Voice input"
        className={`h-10 px-3 rounded-lg border ${listening ? "border-green-500" : "border-neutral-300 dark:border-neutral-700"}`}>
        🎤
      </button>
      <button onClick={() => setOpenPlates(true)} title="Plate calculator" className="h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700">🥞</button>
      <button
        onClick={() => {
          hapticTap();
          const wKg = fromUserUnits(parseFloat(weight) || 0, unit);
          const r = parseInt(reps) || undefined;
          const rpeNum = parseFloat(rpe) || undefined;
          completeSet(exId, setId, { weight: isNaN(wKg) ? undefined : wKg, reps: r, rpe: rpeNum });
        }}
        className="h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black"
      >
        ✓
      </button>

      <PlateModal
        open={openPlates}
        onClose={() => setOpenPlates(false)}
        initialTarget={parseFloat(weight) || undefined}
      />
    </div>
  );
}
