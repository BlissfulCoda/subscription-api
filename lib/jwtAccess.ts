import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./httpErrors.js";

export function issueAccessToken(userId: number): string {
  if (!env.JWT_SECRET) {
    throw new AppError(
      500,
      "SERVER_MISCONFIGURED",
      "Authentication is not configured (missing JWT_SECRET).",
    );
  }
  const expiresIn =
    env.JWT_EXPIRES_IN && env.JWT_EXPIRES_IN.trim().length > 0
      ? env.JWT_EXPIRES_IN
      : "7d";

  return jwt.sign(
    { sub: String(userId) },
    env.JWT_SECRET,
    { expiresIn } as SignOptions,
  );
}

export function verifyAccessToken(token: string): number {
  if (!env.JWT_SECRET) {
    throw new AppError(
      500,
      "SERVER_MISCONFIGURED",
      "Authentication is not configured (missing JWT_SECRET).",
    );
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & {
      sub?: string;
    };
    const sub = decoded.sub;
    if (typeof sub !== "string" || sub.length === 0) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid access token payload.");
    }
    const id = Number(sub);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid access token subject.");
    }
    return id;
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (e instanceof jwt.JsonWebTokenError || e instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired access token.");
    }
    throw e;
  }
}
