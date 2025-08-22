"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY");
    process.exit(1);
}
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
// 🔒 Lock here — only allow Llama 3.1 models
const ALLOWED_MODELS = new Set(["llama-3.1-8b-instant"]);
const client = new groq_sdk_1.default({ apiKey: GROQ_API_KEY });
app.post("/api/coach", async (req, res) => {
    try {
        const { messages } = req.body;
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
    }
    catch (err) {
        console.error("Coach error:", err?.message || err);
        return res.status(500).json({ error: "AI Coach error" });
    }
});
const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
    console.log(`AI Coach server (TS) on http://localhost:${port}`);
});
