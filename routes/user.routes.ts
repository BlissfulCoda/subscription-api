import { Router, type Request, type Response } from "express";

import {
  getMe,
  getUser,
  getUsers,
  postUser,
} from "../controllers/users.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.post("/", postUser);

userRouter.get("/me", requireAuth, getMe);

userRouter.get("/", getUsers);

userRouter.get("/:id", requireAuth, getUser);

userRouter.put("/:id", (req: Request, res: Response) =>
  res.send({ title: "UPDATE user", id: req.params.id }),
);

userRouter.delete("/:id", (req: Request, res: Response) =>
  res.send({ title: "DELETE user", id: req.params.id }),
);

export default userRouter;