import Modal from "./Modal";
import type { DbExercise } from "../data/exercisesDb";

export default function ExerciseInfoModal({
  open, onClose, exercise,
}: { open: boolean; onClose: () => void; exercise?: DbExercise | null }) {
  if (!open || !exercise) return null;
  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="space-y-3">
        <div className="text-sm opacity-70">
          {exercise.primary} • {exercise.equipment.join(", ") || "No equipment"}
        </div>
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
