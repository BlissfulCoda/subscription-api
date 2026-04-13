import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../database/neondb.js";
import { issueAccessToken } from "../lib/jwtAccess.js";

function bearer(userId: number): { Authorization: string } {
  return { Authorization: `Bearer ${issueAccessToken(userId)}` };
}

describe("GET /api/v1/users", () => {
  beforeEach(() => {
    vi.spyOn(prisma.user, "findUnique").mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 403 for GET / (bulk listing disabled)", async () => {
    const res = await request(createApp()).get("/api/v1/users");

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe("FORBIDDEN");
  });

  it("returns 200 for GET /me with valid Bearer token", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T00:00:00.000Z");
    vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: 7,
      name: "Me User",
      email: "me@example.com",
      password: "$2b$12$hash",
      createdAt,
      updatedAt,
    });

    const res = await request(createApp())
      .get("/api/v1/users/me")
      .set(bearer(7));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: 7,
      name: "Me User",
      email: "me@example.com",
    });
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 401 for GET /me without Authorization", async () => {
    const res = await request(createApp()).get("/api/v1/users/me");

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("UNAUTHORIZED");
  });

  it("returns 200 for GET /:id when token matches id", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T00:00:00.000Z");
    vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: 42,
      name: "Bob",
      email: "bob@example.com",
      password: "$2b$12$hash",
      createdAt,
      updatedAt,
    });

    const res = await request(createApp())
      .get("/api/v1/users/42")
      .set(bearer(42));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: 42,
      name: "Bob",
      email: "bob@example.com",
    });
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 401 for GET /:id without Authorization", async () => {
    const res = await request(createApp()).get("/api/v1/users/42");

    expect(res.status).toBe(401);
    expect(res.body.error?.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 when token user does not match :id", async () => {
    const res = await request(createApp())
      .get("/api/v1/users/99")
      .set(bearer(1));

    expect(res.status).toBe(403);
    expect(res.body.error?.code).toBe("FORBIDDEN");
  });

  it("returns 404 when user does not exist (authorized self)", async () => {
    vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

    const res = await request(createApp())
      .get("/api/v1/users/5")
      .set(bearer(5));

    expect(res.status).toBe(404);
    expect(res.body.error?.code).toBe("NOT_FOUND");
  });

  it("returns 400 for invalid id param (Zod)", async () => {
    const res = await request(createApp())
      .get("/api/v1/users/not-a-number")
      .set(bearer(1));

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe("VALIDATION_ERROR");
  });
});
