export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function openRouterChat(messages: ChatMessage[]) {
  const base = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages,
      temperature: 0.2
    }),
    cache: "no-store"
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}
