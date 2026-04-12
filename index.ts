import { env } from "./config/env.js";
import express, { type Request, type Response } from "express";

import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";

const server = express();
const PORT: number = Number(env.PORT) || 8080;
const environment: string = env.NODE_ENV;

server.use("/api/v1/auth", authRouter);
server.use("/api/v1/subscriptions", subscriptionRouter);
server.use("/api/v1/users", userRouter);

server.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Express`);
});

server.listen(env.PORT, () =>
  console.log(
    `Subscription API server is running on port: http://localhost:${String(PORT)} (${environment})`,
  ),
);
