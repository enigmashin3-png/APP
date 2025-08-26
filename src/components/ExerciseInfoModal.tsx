import Modal from "./Modal";
import type { DbExercise } from "../data/exercisesDb";

export default function ExerciseInfoModal({
  open, onClose, exercise,
}: { open: boolean; onClose: () => void; exercise?: DbExercise | null }) {
  if (!open || !exercise) return null;
  const hasMedia = !!(exercise.gifUrl || exercise.imageUrl || (exercise.images && exercise.images.length));
  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="space-y-3">
        <div className="text-sm opacity-70">
          {exercise.primary} • {exercise.equipment.join(", ") || "No equipment"}
        </div>

        {hasMedia && (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2">
            {/* MEDIA PLACEHOLDER — safe if URLs are missing. Add actual <img> or <video> when data is ready. */}
            {exercise.gifUrl && (
              <div className="rounded-lg overflow-hidden">
                {/* Future: <img src={exercise.gifUrl} alt={`${exercise.name} demo`} className="w-full h-auto" /> */}
                <div className="text-xs opacity-70 p-2">GIF available (hidden until integrated): {exercise.gifUrl}</div>
              </div>
            )}
            {!exercise.gifUrl && exercise.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                {/* Future: <img src={exercise.imageUrl} alt={`${exercise.name} image`} className="w-full h-auto" /> */}
                <div className="text-xs opacity-70 p-2">Image available (hidden until integrated): {exercise.imageUrl}</div>
              </div>
            )}
          </div>
        )}

        <div className="whitespace-pre-wrap leading-relaxed">
          {exercise.description || "No description available."}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black">Close</button>
        </div>
      </div>
    </Modal>
  );
}
