import rateLimit from "express-rate-limit";

const skipInTests = (): boolean => process.env.VITEST === "true";

/** Broad cap across `/api/v1` (excluding auth, which has its own stricter limiter). */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests; try again later.",
      },
    });
  },
});

/** Tighter window for credential and token issuance endpoints. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many authentication attempts; try again later.",
      },
    });
  },
});
