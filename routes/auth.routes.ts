import { Router, type Request, type Response } from "express";

const authRouter = Router();

// authRouter.get("/", (req: Request, res: Response) =>
//   res.json({
//     message: "Auth API",
//     endpoints: ["/sign-in", "/sign-up", "/sign-out"],
//   }),
// );

authRouter.get("/sign-in", (req: Request, res: Response) =>
  res.json({ message: "Sign In" }),
);

authRouter.get("/sign-up", (req: Request, res: Response) =>
  res.json({ message: "Sign up" }),
);

authRouter.get("/sign-out", (req: Request, res: Response) =>
  res.json({ message: "Sign out" }),
);

export default authRouter;
