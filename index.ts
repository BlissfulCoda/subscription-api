import { env } from "./config/env.js";
import express, { type Request, type Response } from "express";

const server = express();
const PORT: number = Number(env.PORT) || 8080;
const environment: string = env.NODE_ENV;

server.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Express`);
});

server.listen(env.PORT, () =>
  console.log(
    `Subscription API server is running on port: http://localhost:${String(PORT)} (${environment})`,
  ),
);
