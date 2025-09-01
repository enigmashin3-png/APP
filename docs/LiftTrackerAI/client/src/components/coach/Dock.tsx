"use client";
import { useCoachSuggest } from "@/hooks/useCoachSuggest";
import { useState } from "react";

export default function CoachDock({ getRecentSets }: { getRecentSets: () => any[] }) {
  const { loading, tips, suggest } = useCoachSuggest();
  const [shoulder, setShoulder] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 rounded-2xl shadow-lg bg-white/90 dark:bg-zinc-900 p-4 w-80 space-y-3">
      <div className="font-semibold">AI Coach</div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={shoulder} onChange={(e) => setShoulder(e.target.checked)} />
        Shoulder pain flag
      </label>
      <button
        onClick={() =>
          suggest({ recentSets: getRecentSets(), painFlags: shoulder ? ["shoulder"] : [] })
        }
        disabled={loading}
        className="w-full rounded-xl py-2 text-sm bg-black text-white disabled:opacity-60"
      >
        {loading ? "Thinking..." : "Get Tips"}
      </button>

      {tips.ai && (
        <div className="text-sm border rounded-lg p-3">
          <div className="font-medium mb-1">Coach says</div>
          <div className="whitespace-pre-wrap">{tips.ai}</div>
        </div>
      )}

      {tips.ruleTips?.length > 0 && (
        <div className="text-sm border rounded-lg p-3">
          <div className="font-medium mb-1">Heuristic checks</div>
          <ul className="list-disc ml-4">
            {tips.ruleTips.map((t: any, i: number) => (
              <li key={i}>
                [{t.tag}] {t.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
