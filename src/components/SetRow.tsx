import { useMemo, useState } from "react";
import { useWorkoutStore } from "../store/workout";
import { isVoiceSupported, startDictation, parseWeightReps } from "../utils/voice";
import { fromUserUnits, toUserUnits, unitLabel } from "../lib/units";
import PlateModal from "./PlateModal";
import { hapticTap } from "../lib/haptics";
import { lastCompletedSetInActiveByExId, lastCompletedSetInHistory } from "../utils/history";
import { personalRecord, est1RM } from "../utils/prs";

type Props = { exId: string; setId: string };

export default function SetRow({ exId, setId }: Props) {
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const active = useWorkoutStore((s) => s.activeWorkout);
  const history = useWorkoutStore((s) => s.history);
  const unit = useWorkoutStore((s) => s.settings.unit);

  const exercise = useMemo(
    () => active?.exercises.find((e) => e.id === exId),
    [active, exId]
  );
  const exerciseName = exercise?.name ?? "";

  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [listening, setListening] = useState(false);
  const [openPlates, setOpenPlates] = useState(false);

  // PR proximity computation
  const prValueKg = useMemo(() => personalRecord(history, exerciseName)?.v, [history, exerciseName]);
  const candidate1RMkg = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r) return undefined;
    const kg = fromUserUnits(w, unit);
    return est1RM(kg, r);
  }, [weight, reps, unit]);

  const prStatus = useMemo(() => {
    if (!prValueKg || !candidate1RMkg) return { text: "", tone: "none" as const };
    if (candidate1RMkg >= prValueKg) {
      return { text: "🚀 PR pace — press ✓ to log!", tone: "pr" as const };
    }
    const ratio = candidate1RMkg / prValueKg;
    if (ratio >= 0.98) {
      const pct = Math.round((ratio - 1) * 100); // negative but near zero
      return { text: "🔥 Close to PR (within ~2%)", tone: "close" as const };
    }
    return { text: "", tone: "none" as const };
  }, [candidate1RMkg, prValueKg]);

  const onVoice = () => {
    if (!isVoiceSupported()) return alert("Voice input not supported in this browser.");
    setListening(true);
    startDictation((text) => {
      const { weight: w, reps: r } = parseWeightReps(text);
      if (typeof w === "number") setWeight(String(w));
      if (typeof r === "number") setReps(String(r));
    }, () => setListening(false));
  };

  const onRepeat = () => {
    // Prefer last completed in this exercise during current workout; fall back to history
    const inActive = lastCompletedSetInActiveByExId(active ?? null, exId);
    const fallback = exerciseName ? lastCompletedSetInHistory(history, exerciseName) : null;
    const src = inActive ?? fallback;
    if (!src) return;
    if (typeof src.weight === "number") setWeight(String(toUserUnits(src.weight, unit)));
    if (typeof src.reps === "number") setReps(String(src.reps));
    if (typeof src.rpe === "number") setRpe(String(src.rpe));
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto_auto_auto] gap-2 items-center">
        <input
          inputMode="decimal"
          placeholder={unitLabel(unit)}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          aria-label={`Weight in ${unitLabel(unit)}`}
        />
        <input
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          aria-label="Reps"
        />
        <input
          inputMode="decimal"
          placeholder="RPE"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          className="h-10 rounded-lg px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          aria-label="RPE"
        />

        {/* Repeat last */}
        <button
          onClick={onRepeat}
          title="Repeat last"
          aria-label="Repeat last set"
          className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-700"
        >
          ↻
        </button>

        {/* Voice */}
        <button
          onClick={onVoice}
          title="Voice input"
          aria-label="Voice input"
          className={`h-10 w-10 rounded-lg border ${listening ? "border-green-500" : "border-neutral-300 dark:border-neutral-700"}`}
        >
          🎤
        </button>

        {/* Plates */}
        <button
          onClick={() => setOpenPlates(true)}
          title="Plate calculator"
          aria-label="Plate calculator"
          className="h-10 w-10 rounded-lg border border-neutral-300 dark:border-neutral-700"
        >
          🥞
        </button>

        {/* Save */}
        <button
          onClick={() => {
            hapticTap();
            const wVal = fromUserUnits(parseFloat(weight) || 0, unit);
            const rVal = parseInt(reps) || undefined;
            const rpeNum = parseFloat(rpe) || undefined;
            completeSet(exId, setId, {
              weight: isNaN(wVal) ? undefined : wVal,
              reps: rVal,
              rpe: rpeNum,
            });
          }}
          className={`h-10 px-4 rounded-lg text-white dark:text-black ${prStatus.tone === "pr" ? "bg-green-700 dark:bg-green-400" : "bg-black dark:bg-white"}`}
        >
          ✓
        </button>

        <PlateModal
          open={openPlates}
          onClose={() => setOpenPlates(false)}
          initialTarget={parseFloat(weight) || undefined}
        />
      </div>

      {/* PR nudge line */}
      {prStatus.tone !== "none" && (
        <div
          className={`text-xs rounded-md px-2 py-1 inline-block ${
            prStatus.tone === "pr"
              ? "bg-green-600/10 border border-green-600/30"
              : "bg-amber-500/10 border border-amber-500/30"
          }`}
        >
          {prStatus.text}
        </div>
      )}
    </div>
  );
}
