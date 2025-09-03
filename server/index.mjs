import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// health
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

// static build
app.use(express.static(path.join(__dirname, "../dist")));

// fallback SPA
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// 404
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server Error" });
});

app.listen(PORT, () => console.log(`Server on :${PORT}`));
