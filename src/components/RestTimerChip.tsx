import { useEffect, useState } from "react";

export default function RestTimerChip({ endAt }: { endAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, endAt - now);
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm border-neutral-300 dark:border-neutral-700">
      Rest {m}:{sec.toString().padStart(2, "0")}
    </span>
  );
}
