import request from "supertest";
import app from "./index.js";

describe("Express server", () => {
  it("responds to GET / with 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });
});
