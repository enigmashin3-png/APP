import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GROQ_API_KEY" });
    const { messages, model } = req.body || {};
    const r = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
          messages,
        }),
      },
    );
    const j = await r.json();
    res.json(j);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "coach failed" });
  }
});

export default router;

