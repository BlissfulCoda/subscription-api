import { Router, type Request, type Response } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (_req: Request, res: Response) =>
  res.send({ title: "GET all subscriptions" }),
);

/** Static paths must be registered before `/:id` so `user` is not captured as an id. */
subscriptionRouter.get("/upcoming-renewals", (_req: Request, res: Response) =>
  res.send({ title: "GET upcoming subscription renewals" }),
);

subscriptionRouter.get("/user/:id", (req: Request, res: Response) =>
  res.send({ title: "GET all user subscriptions", userId: req.params.id }),
);

subscriptionRouter.post("/", (_req: Request, res: Response) =>
  res.send({ title: "CREATE a subscription" }),
);

subscriptionRouter.put("/:id/cancel", (req: Request, res: Response) =>
  res.send({ title: "CANCEL a subscription", id: req.params.id }),
);

subscriptionRouter.get("/:id", (req: Request, res: Response) =>
  res.send({ title: "GET subscription details", id: req.params.id }),
);

subscriptionRouter.put("/:id", (req: Request, res: Response) =>
  res.send({ title: "UPDATE a subscription", id: req.params.id }),
);

subscriptionRouter.delete("/:id", (req: Request, res: Response) =>
  res.send({ title: "DELETE a subscription", id: req.params.id }),
);

export default subscriptionRouter;
