import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../database/neondb.js";
import { Prisma } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

describe("POST /api/v1/auth", () => {
  beforeEach(() => {
    vi.spyOn(prisma.user, "findUnique").mockReset();
    vi.spyOn(prisma.user, "create").mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sign-in", () => {
    it("returns 400 for invalid body (Zod)", async () => {
      const res = await request(createApp())
        .post("/api/v1/auth/sign-in")
        .send({ email: "not-an-email", password: "" });

      expect(res.status).toBe(400);
      expect(res.body.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns 401 when user is not found", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      const res = await request(createApp())
        .post("/api/v1/auth/sign-in")
        .send({ email: "ghost@example.com", password: "secret12" });

      expect(res.status).toBe(401);
      expect(res.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 when password does not match", async () => {
      const hash = bcrypt.hashSync("correct-password", 12);
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(createApp())
        .post("/api/v1/auth/sign-in")
        .send({ email: "alice@example.com", password: "wrong-password" });

      expect(res.status).toBe(401);
      expect(res.body.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns 200 with token and public user when credentials are valid", async () => {
      const hash = bcrypt.hashSync("secret12", 12);
      const createdAt = new Date("2024-01-01T00:00:00.000Z");
      const updatedAt = new Date("2024-01-01T00:00:00.000Z");
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
        id: 99,
        name: "Alice Example",
        email: "alice@example.com",
        password: hash,
        createdAt,
        updatedAt,
      });

      const res = await request(createApp())
        .post("/api/v1/auth/sign-in")
        .send({ email: "alice@example.com", password: "secret12" });

      expect(res.status).toBe(200);
      expect(res.body.data.user).toMatchObject({
        id: 99,
        name: "Alice Example",
        email: "alice@example.com",
      });
      expect(res.body.data.user.password).toBeUndefined();
      expect(typeof res.body.data.token).toBe("string");

      const secret =
        process.env.JWT_SECRET ??
        "test-jwt-secret-for-vitest-only-min-32-chars";
      const decoded = jwt.verify(res.body.data.token, secret);
      expect(decoded).toMatchObject({ sub: "99" });
    });
  });

  describe("sign-up", () => {
    it("returns 201 with token and public user when create succeeds", async () => {
      const createdAt = new Date("2024-01-01T00:00:00.000Z");
      const updatedAt = new Date("2024-01-01T00:00:00.000Z");

      vi.spyOn(prisma.user, "create").mockResolvedValue({
        id: 42,
        name: "Bob Example",
        email: "bob@example.com",
        password: "$2b$12$hashed",
        createdAt,
        updatedAt,
      });

      const res = await request(createApp())
        .post("/api/v1/auth/sign-up")
        .send({
          name: "Bob Example",
          email: "bob@example.com",
          password: "secret12",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user).toMatchObject({
        id: 42,
        name: "Bob Example",
        email: "bob@example.com",
      });
      expect(res.body.data.user.password).toBeUndefined();
      expect(typeof res.body.data.token).toBe("string");
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
        .post("/api/v1/auth/sign-up")
        .send({
          name: "Bob",
          email: "dup@example.com",
          password: "secret12",
        });

      expect(res.status).toBe(409);
      expect(res.body.error?.code).toBe("CONFLICT");
    });
  });

  describe("sign-out", () => {
    it("returns 200 with signedOut true", async () => {
      const res = await request(createApp()).post("/api/v1/auth/sign-out");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ signedOut: true });
    });
  });
});




