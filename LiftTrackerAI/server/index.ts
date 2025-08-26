import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import Groq from "groq-sdk";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

import { initExerciseRoute } from "./exercisesRoute.js";
initExerciseRoute(app);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn("Missing GROQ_API_KEY – /api/coach will be disabled");
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
// 🔒 Lock here — only allow Llama 3.1 models
const ALLOWED_MODELS = new Set<string>(["llama-3.1-8b-instant"]);

const client = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

app.post("/api/coach", async (req: Request, res: Response) => {
  if (!client) {
    return res.status(500).json({ error: "AI Coach not configured" });
  }
  try {
    const { messages } = req.body as { messages?: ChatMsg[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages" });
    }

    if (!ALLOWED_MODELS.has(GROQ_MODEL)) {
      return res.status(403).json({ error: "Model not allowed" });
    }

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.3
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";
    return res.json({ model: GROQ_MODEL, reply });
  } catch (err: any) {
    console.error("Coach error:", err?.message || err);
    return res.status(500).json({ error: "AI Coach error" });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`AI Coach server (TS) on http://localhost:${port}`);
});
