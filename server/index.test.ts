import express from "express";
import request from "supertest";
import fs from "node:fs";
import path from "node:path";

const distPath = path.resolve(__dirname, "../dist");

describe("Static bundle server", () => {
  it("serves index.html from dist", async () => {
    if (!fs.existsSync(distPath)) {
      // Build the app if dist is missing
      console.log("Building web bundle for test...");
      await import("node:child_process").then(({ execSync }) => {
        execSync("npm run build:web", { stdio: "inherit" });
      });
    }
    const app = express();
    app.use(express.static(distPath));
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>Lift Legends</title>");
  });
});
