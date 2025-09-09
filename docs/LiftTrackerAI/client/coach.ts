import { COACH_URL } from "../../src/config/coach.js";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function askCoach(messages: ChatMsg[]) {
  const resp = await fetch(COACH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    let msg = "Coach API error";
    try {
      const j = await resp.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await resp.json()) as { model: string; reply: string };
}
