import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/httpErrors.js";
import { logRequestError } from "../lib/logRequestError.js";
import {
  isPrismaTableDoesNotExist,
  isPrismaUniqueViolation,
} from "../lib/prismaErrors.js";


export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  next,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (isPrismaUniqueViolation(err)) {
    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "A record with this unique value already exists.",
        details: err.meta,
      },
    });
    return;
  }

  if (isPrismaTableDoesNotExist(err)) {
    res.status(503).json({
      error: {
        code: "SCHEMA_NOT_APPLIED",
        message:
          "Database tables are missing. Apply migrations: `pnpm exec prisma migrate deploy` (uses DIRECT_URL; see README).",
        details: err.meta,
      },
    });
    return;
  }

  logRequestError(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
