import { useSupportStore } from "../store/support";

export default function CopyRequestId() {
  const reqId = useSupportStore((s) => s.lastRequestId);
  const rl = useSupportStore((s) => s.rateLimit);
  if (!reqId && !rl) return null;
  return (
    <div className="mt-3 space-y-2 text-xs opacity-80">
      {reqId && (
        <div className="flex items-center gap-2">
          <span>Request ID:</span>
          <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {reqId.slice(0, 8)}…
          </code>
          <button
            className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(reqId);
              } catch (_) {
                /* ignore */
              }
            }}
          >
            Copy
          </button>
        </div>
      )}
      {rl?.retryAfter && (
        <div className="text-amber-600 dark:text-amber-400">Rate limited. Try again in ~{rl.retryAfter}s.</div>
      )}
      {rl && rl.limit && typeof rl.remaining === 'number' && rl.remaining <= 1 && !rl.retryAfter && (
        <div>Approaching rate limit — remaining {rl.remaining}.</div>
      )}
    </div>
  );
}
