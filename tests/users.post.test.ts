import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../database/neondb.js";
import { Prisma } from "../generated/prisma/client.js";

describe("POST /api/v1/users", () => {
  beforeEach(() => {
    vi.spyOn(prisma.user, "create").mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid body (Zod)", async () => {
    const res = await request(createApp())
      .post("/api/v1/users")
      .send({ name: "A", email: "not-an-email", password: "12345" });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 201 and public user when create succeeds", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T00:00:00.000Z");

    vi.spyOn(prisma.user, "create").mockResolvedValue({
      id: 42,
      name: "Alice Example",
      email: "alice@example.com",
      password: "$2b$12$hashed",
      createdAt,
      updatedAt,
    });

    const res = await request(createApp())
      .post("/api/v1/users")
      .send({
        name: "Alice Example",
        email: "alice@example.com",
        password: "secret12",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      id: 42,
      name: "Alice Example",
      email: "alice@example.com",
    });
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.createdAt).toBe(createdAt.toISOString());
    expect(res.body.data.updatedAt).toBe(updatedAt.toISOString());
  });

  it("returns 409 when email already exists (P2002)", async () => {
    const err = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "test",
        meta: { modelName: "User", target: ["email"] },
      },
    );
    vi.spyOn(prisma.user, "create").mockRejectedValue(err);

    const res = await request(createApp())
      .post("/api/v1/users")
      .send({
        name: "Bob",
        email: "dup@example.com",
        password: "secret12",
      });

    expect(res.status).toBe(409);
    expect(res.body.error?.code).toBe("CONFLICT");
    expect(res.body.error?.message).toMatch(/email/i);
  });
});
