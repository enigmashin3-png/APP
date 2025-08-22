require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk").default;

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY");
  process.exit(1);
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const ALLOWED_MODELS = ["llama-3.1-8b-instant", "llama-3.1-70b-versatile"]; // lock models

const client = new Groq({ apiKey: GROQ_API_KEY });

app.post("/api/coach", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages) {
      return res.status(400).json({ error: "Missing messages" });
    }

    // enforce allowed model
    if (!ALLOWED_MODELS.includes(GROQ_MODEL)) {
      return res.status(403).json({ error: "Model not allowed" });
    }

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Coach error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`AI Coach server on port ${port}`));
