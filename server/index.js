import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the Vite build output
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// TODO: add your API routes before the SPA fallback
// e.g. app.use('/api', apiRouter);

// SPA fallback: send index.html for any GET that isn't handled above
app.use((req, res, next) => {
  if (req.method === "GET") {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) next(err);
      });
    } else {
      res.status(200).send("");
    }
  } else {
    next();
  }
});

// 404 for non-GET or unmatched API routes
app.use((req, res, next) => {
  if (req.method !== "GET") {
    return res.status(404).json({ error: "Not Found" });
  }
  next();
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: "Internal Server Error" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
