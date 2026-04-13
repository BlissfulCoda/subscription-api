import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { createUser } from "../services/user.service.js";

const userRouter = Router();

userRouter.get("/", (_req: Request, res: Response) =>
  res.send({ title: "GET all users" }),
);

userRouter.get("/:id", (req: Request, res: Response) =>
  res.send({ title: "GET user info", id: req.params.id }),
);

userRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = await createUser(req.body);
      res.status(201).json({ data: user });
    } catch (e) {
      next(e);
    }
  },
);

userRouter.put("/:id", (req: Request, res: Response) =>
  res.send({ title: "UPDATE user", id: req.params.id }),
);

userRouter.delete("/:id", (req: Request, res: Response) =>
  res.send({ title: "DELETE user", id: req.params.id }),
);

export default userRouter;
