require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk").default;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY");
  process.exit(1);
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const ALLOWED_MODELS = ["llama-3.1-8b-instant"]; // lock to llama 3.1 (8B). Add 70B if you want.

const client = new Groq({ apiKey: GROQ_API_KEY });

app.post("/api/coach", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages" });
    }

    if (!ALLOWED_MODELS.includes(GROQ_MODEL)) {
      return res.status(403).json({ error: "Model not allowed" });
    }

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.3,
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";
    return res.json({ model: GROQ_MODEL, reply });
  } catch (err) {
    console.error("Coach error:", err?.message || err);
    return res.status(500).json({ error: "AI Coach error" });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`AI Coach server running on http://localhost:${port}`);
});
