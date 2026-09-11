import type { NextFunction, Request, Response } from "express";
import {
  findAuthenticatedUserBySessionToken,
  getClearSessionCookieOptions,
  SESSION_COOKIE,
  type AuthenticatedUser,
} from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    next();
    return;
  }

  try {
    const user = await findAuthenticatedUserBySessionToken(token);
    if (user) {
      req.user = user;
    } else {
      res.clearCookie(SESSION_COOKIE, getClearSessionCookieOptions());
    }
  } catch (error) {
    req.log?.error({ error }, "Unable to load authentication session");
  }

  next();
}