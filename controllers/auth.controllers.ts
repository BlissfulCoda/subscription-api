import { type Request, type Response, type NextFunction } from "express";
import { createUser, signInUser } from "../services/user.service.js";
import { issueAccessToken } from "../lib/jwtAccess.js";

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = await signInUser(req.body);
    const token = issueAccessToken(user.id);
    res.status(200).json({ data: { user, token } });
  } catch (e) {
    next(e);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = await createUser(req.body);
    const token = issueAccessToken(user.id);
    res.status(201).json({ data: { user, token } });
  } catch (e) {
    next(e);
  }
};

export const signOut = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({ data: { signedOut: true } });
  } catch (e) {
    next(e);
  }
};
