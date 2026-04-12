import express, { type Request, type Response } from "express";

const server = express();
const PORT: number = 5500;

server.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Express`);
});

server.listen(PORT, () =>
  console.log(`Subscription server is running on port: ${PORT}`),
);
