type Props = { onClick: () => void };
export default function FAB({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Log a workout"
      className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full shadow-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80 backdrop-blur text-2xl"
    >
      +
    </button>
  );
}
