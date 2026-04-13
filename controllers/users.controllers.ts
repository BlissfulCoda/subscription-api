import { type Request, type Response, type NextFunction } from "express";
import {
  createUser,
  findUserById,
  userIdParamSchema,
} from "../services/user.service.js";
import { AppError } from "../lib/httpErrors.js";

/** Intentionally disabled: open user listing is a privacy and abuse risk without admin/tenant scoping. */
export const getUsers = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      403,
      "FORBIDDEN",
      "Listing all users is not enabled (would require elevated access in production).",
    ),
  );
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.authUserId;
    if (id === undefined) {
      throw new AppError(
        500,
        "INTERNAL_ERROR",
        "Authentication context was not set.",
      );
    }
    const { user } = await findUserById(String(id));
    res.status(200).json({ data: user });
  } catch (e) {
    next(e);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const requestedId = userIdParamSchema.parse(rawId);
    if (req.authUserId !== requestedId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You can only access your own user profile.",
      );
    }
    const { user } = await findUserById(rawId);
    res.status(200).json({ data: user });
  } catch (e) {
    next(e);
  }
};

export const postUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = await createUser(req.body);
    res.status(201).json({ data: user });
  } catch (e) {
    next(e);
  }
};
