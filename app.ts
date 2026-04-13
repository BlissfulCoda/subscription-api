import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { errorMiddleware } from "./middleware/error.middleware.js";
import {
  apiRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimit.middleware.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";

/** Builds the HTTP app (no listen, no DB connect) — used in production and in tests. */
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.send("subscription-api");
  });

  app.use("/api/v1/auth", authRateLimiter, authRouter);
  app.use("/api/v1/subscriptions", apiRateLimiter, subscriptionRouter);
  app.use("/api/v1/users", apiRateLimiter, userRouter);

  app.use(errorMiddleware);

  return app;
}
