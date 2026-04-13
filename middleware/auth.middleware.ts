import type { RequestHandler } from "express";
import { AppError } from "../lib/httpErrors.js";
import { verifyAccessToken } from "../lib/jwtAccess.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const auth = req.headers.authorization;
    if (typeof auth !== "string" || !auth.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authorization header missing or not a Bearer token.",
      );
    }
    const raw = auth.slice("Bearer ".length).trim();
    if (!raw) {
      throw new AppError(401, "UNAUTHORIZED", "Missing access token.");
    }
    req.authUserId = verifyAccessToken(raw);
    next();
  } catch (e) {
    next(e);
  }
};
