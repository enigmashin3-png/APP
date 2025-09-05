import { useState } from "react";
import { COACH_URL } from "../config/coach";
import { useWorkoutStore } from "../store/workout";
import { useSupportStore } from "../store/support";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export function useCoach() {
  const coachStream = useWorkoutStore((s) => !!s.settings.coachStream);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "system",
      content: "You are Lift Legends AI Coach. Be concise and practical.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const setLastRequestId = useSupportStore((s) => s.setLastRequestId);
  const setRateLimit = useSupportStore((s) => s.setRateLimit);

  const ask = async (content: string) => {
    // Optimistically append the user message
    const base = [...messages, { role: "user", content } as Msg];
    setMessages(base);
    setLoading(true);
    try {
      const rid = (crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
      if (coachStream) {
        // Streaming via SSE over fetch POST
        const resp = await fetch(COACH_URL + "?stream=1", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Request-Id": rid, "X-Stream": "1" },
          body: JSON.stringify({ messages: base }),
        });
        setLastRequestId(resp.headers.get("x-request-id"));
        if (resp.status === 429) {
          const retryAfter = Number(resp.headers.get("retry-after") || 60);
          setRateLimit({ retryAfter });
          setMessages([...base, { role: "assistant", content: `You're sending requests too fast. Try again in ~${retryAfter}s.` }]);
          return;
        }
        setRateLimit({
          limit: Number(resp.headers.get("x-ratelimit-limit") || 0) || undefined,
          remaining: Number(resp.headers.get("x-ratelimit-remaining") || 0) || undefined,
        });
        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let assistant = "";
        setMessages([...base, { role: "assistant", content: "" }]);
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            const parts = acc.split("\n\n");
            acc = parts.pop() || "";
            for (const chunk of parts) {
              const line = chunk.trim();
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content || json?.choices?.[0]?.message?.content || "";
                if (delta) {
                  assistant += String(delta);
                  setMessages([...base, { role: "assistant", content: assistant }]);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
        if (assistant.trim().length === 0) {
          setMessages([...base, { role: "assistant", content: "No response." }]);
        }
      } else {
        const r = await fetch(COACH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Request-Id": rid },
          body: JSON.stringify({ messages: base }),
        });
        setLastRequestId(r.headers.get("x-request-id"));
        if (r.status === 429) {
          const retryAfter = Number(r.headers.get("retry-after") || 60);
          setRateLimit({ retryAfter });
          setMessages([...base, { role: "assistant", content: `You're sending requests too fast. Try again in ~${retryAfter}s.` }]);
          return;
        }
        setRateLimit({
          limit: Number(r.headers.get("x-ratelimit-limit") || 0) || undefined,
          remaining: Number(r.headers.get("x-ratelimit-remaining") || 0) || undefined,
        });
        const j = await r.json().catch(() => ({} as any));
        const reply = (j?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.").trim();
        setMessages([...base, { role: "assistant", content: reply }]);
      }
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
