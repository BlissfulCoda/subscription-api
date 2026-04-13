import { Router, type Request, type Response } from "express";
import { signIn, signUp, signOut } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.get("/", (_req: Request, res: Response) =>
  res.json({
    message: "Auth API",
    endpoints: ["POST /sign-in", "POST /sign-up", "POST /sign-out"],
  }),
);

authRouter.post("/sign-in", signIn);

authRouter.post("/sign-up", signUp);

authRouter.post("/sign-out", signOut);

export default authRouter;
