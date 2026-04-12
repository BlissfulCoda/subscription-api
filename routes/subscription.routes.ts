import { Router, type Request, type Response } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req: Request, res: Response) =>
  res.send({ title: "GET all subscriptions" }),
);

subscriptionRouter.get("/:id", (req: Request, res: Response) =>
  res.send({ title: "GET subscription details" }),
);

subscriptionRouter.post("/", (req: Request, res: Response) =>
  res.send({ title: "CREATE a subscription" }),
);

subscriptionRouter.put("/", (req: Request, res: Response) =>
  res.send({ title: "UPDATE a subscription" }),
);

subscriptionRouter.delete("/", (req: Request, res: Response) =>
  res.send({ title: "DELETE a subscription" }),
);

subscriptionRouter.get("/user/:id", (req: Request, res: Response) =>
  res.send({ title: "GET all user subscriptions" }),
);

subscriptionRouter.put("/:id/cancel", (req: Request, res: Response) =>
  res.send({ title: "CANCEL a subscription" }),
);

subscriptionRouter.put("/upcoming-renewals", (req: Request, res: Response) =>
  res.send({ title: "GET upcoming subscription renewals" }),
);

export default subscriptionRouter;
