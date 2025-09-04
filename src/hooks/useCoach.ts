import { useState } from "react";
import { COACH_URL } from "../config/coach";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export function useCoach() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "system",
      content: "You are Lift Legends AI Coach. Be concise and practical.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const ask = async (content: string) => {
    // Optimistically append the user message
    const base = [...messages, { role: "user", content } as Msg];
    setMessages(base);
    setLoading(true);
    try {
      const r = await fetch(COACH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: base }),
      });
      const j = await r.json().catch(() => ({} as any));
      const reply = (j?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a reply.").trim();
      setMessages([...base, { role: "assistant", content: reply }]);
    } catch (_e) {
      setMessages([
        ...base,
        { role: "assistant", content: "Network error contacting coach. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, ask, loading };
}

