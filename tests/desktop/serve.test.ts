import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";

const distPath = path.resolve(__dirname, "../../dist");

beforeAll(() => {
  if (!fs.existsSync(distPath)) {
    execSync("npm run build:web", { stdio: "inherit" });
  }
});

describe("Desktop app", () => {
  it("serves built web bundle", async () => {
    const app = express();
    app.use(express.static(distPath));
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>Lift Legends</title>");
  });
});
