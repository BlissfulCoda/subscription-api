import { Router, type Request, type Response } from "express";

const authRouter = Router();

authRouter.get("/", (_req: Request, res: Response) =>
  res.json({
    message: "Auth API",
    endpoints: ["POST /sign-in", "POST /sign-up", "DELETE /sign-out"],
  }),
);

authRouter.post("/sign-in", (_req: Request, res: Response) =>
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Sign-in is not implemented yet.",
    },
  }),
);

authRouter.post("/sign-up", (_req: Request, res: Response) =>
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Auth sign-up is not implemented; use POST /api/v1/users to register.",
    },
  }),
);

authRouter.delete("/sign-out", (_req: Request, res: Response) =>
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Sign-out is not implemented yet.",
    },
  }),
);

export default authRouter;
