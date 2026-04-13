import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../app.js";

describe("GET /health", () => {
  it("returns 200 and ok: true", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
