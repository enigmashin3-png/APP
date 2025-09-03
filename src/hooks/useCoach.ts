import { useState } from "react";

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
    const next = [...messages, { role: "user", content } as Msg];
    setMessages(next);
    setLoading(true);
    const r = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });
    const j = await r.json();
    const reply = j?.choices?.[0]?.message?.content || "…";
    setMessages([...next, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return { messages, ask, loading };
}

