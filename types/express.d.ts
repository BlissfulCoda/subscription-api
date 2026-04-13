/** Augment Express so authenticated routes can read `req.authUserId` after {@link requireAuth}. */
declare global {
  namespace Express {
    interface Request {
      authUserId?: number;
    }
  }
}

export {};
