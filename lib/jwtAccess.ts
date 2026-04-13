import jwt, { type SignOptions } from "jsonwebtoken";
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
