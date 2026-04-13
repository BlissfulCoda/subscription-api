import type { RequestHandler } from "express";
import arcjet, { tokenBucket } from "@arcjet/node";
import { env } from "../config/env.js";

const skipArcjet = (): boolean =>
  process.env.VITEST === "true" || !env.ARCJET_KEY;

function createAuthClient() {
  if (env.ARCJET_KEY === undefined) return null;
  return arcjet({
    key: env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: 8,
        interval: "1m",
        capacity: 24,
      }),
    ],
  });
}

function createApiClient() {
  if (env.ARCJET_KEY === undefined) return null;
  return arcjet({
    key: env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: 60,
        interval: "1m",
        capacity: 200,
      }),
    ],
  });
}

const authArcjet = createAuthClient();
const apiArcjet = createApiClient();

function sendRateLimited(
  res: Parameters<RequestHandler>[1],
  auth: boolean,
): void {
  res.status(429).json({
    error: {
      code: "RATE_LIMITED",
      message: auth
        ? "Too many authentication attempts; try again later."
        : "Rate limit exceeded. Try again later.",
    },
  });
}

export const arcjetAuthLimiter: RequestHandler = async (req, res, next) => {
  if (skipArcjet() || authArcjet === null) {
    next();
    return;
  }
  try {
    const decision = await authArcjet.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      sendRateLimited(res, true);
      return;
    }
    next();
  } catch {
    next();
  }
};

export const arcjetApiLimiter: RequestHandler = async (req, res, next) => {
  if (skipArcjet() || apiArcjet === null) {
    next();
    return;
  }
  try {
    const decision = await apiArcjet.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      sendRateLimited(res, false);
      return;
    }
    next();
  } catch {
    next();
  }
};
