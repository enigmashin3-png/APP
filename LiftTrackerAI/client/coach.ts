export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function askCoach(messages: ChatMsg[]) {
  const resp = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) throw new Error("Coach API error");
  return (await resp.json()) as { reply: string };
}
