import type { RequestHandler } from "express";
import { AppError } from "../lib/httpErrors.js";
import { verifyAccessToken } from "../lib/jwtAccess.js";

/** Requires `Authorization: Bearer <access_token>`; sets `req.authUserId`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const auth = req.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) {
    next(
      new AppError(
        401,
        "UNAUTHORIZED",
        "Authorization header missing or not a Bearer token.",
      ),
    );
    return;
  }
  const raw = auth.slice("Bearer ".length).trim();
  if (!raw) {
    next(new AppError(401, "UNAUTHORIZED", "Missing access token."));
    return;
  }
  try {
    req.authUserId = verifyAccessToken(raw);
    next();
  } catch (e) {
    next(e);
  }
};
