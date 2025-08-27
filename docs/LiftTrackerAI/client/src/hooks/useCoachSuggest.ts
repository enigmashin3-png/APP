"use client";
import { useState } from "react";
import { generateRuleTips, type SetEntry } from "@lib/coach/rules";

export function useCoachSuggest() {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<{ ai: string|null; ruleTips: any[] }>({ ai: null, ruleTips: [] });

  async function suggest(input: { recentSets: SetEntry[]; prefs?: any; painFlags?: string[] }) {
    setLoading(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const ruleTips = generateRuleTips(input.recentSets, input.prefs, input.painFlags || []);
        setTips({ ai: null, ruleTips });
        return { ai: null, ruleTips };
      }
      const res = await fetch("/api/coach/tip", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(input) });
      const json = await res.json();
      setTips({ ai: json.ai, ruleTips: json.ruleTips });
      return json;
    } finally {
      setLoading(false);
    }
  }

  return { loading, tips, suggest };
}
