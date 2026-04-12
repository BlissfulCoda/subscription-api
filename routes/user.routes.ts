import { Router, type Request, type Response } from "express";

const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) =>
  res.send({ title: "GET all users" }),
);

userRouter.get("/:id", (req: Request, res: Response) =>
  res.send({ title: "GET user info" }),
);

userRouter.post("/", (req: Request, res: Response) =>
  res.send({ title: "CREATE new user" }),
);

userRouter.put("/:id", (req: Request, res: Response) =>
  res.send({ title: "UPDATE user" }),
);

userRouter.delete("/:id", (req: Request, res: Response) =>
  res.send({ title: "DELETE user" }),
);

export default userRouter;
