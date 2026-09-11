import { Router, type IRouter } from "express";
import {
  GetCurrentUserResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import {
  authenticateUser,
  createSession,
  deleteSession,
  DuplicateEmailError,
  getClearSessionCookieOptions,
  getSessionCookieOptions,
  registerUser,
  SESSION_COOKIE,
} from "../lib/auth";

const router: IRouter = Router();

function validationMessage(error: { issues: Array<{ message: string }> }) {
  return error.issues.map((issue) => issue.message).join(" ");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage(parsed.error) });
    return;
  }

  try {
    const { user, token } = await registerUser(parsed.data);
    res.cookie(SESSION_COOKIE, token, getSessionCookieOptions());
    res.status(201).json(RegisterResponse.parse(user));
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage(parsed.error) });
    return;
  }

  const authenticated = await authenticateUser(parsed.data.email, parsed.data.password);
  if (!authenticated) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  res.cookie(SESSION_COOKIE, authenticated.token, getSessionCookieOptions());
  res.json(LoginResponse.parse(authenticated.user));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await deleteSession(token);
  }

  res.clearCookie(SESSION_COOKIE, getClearSessionCookieOptions());
  res.json(LogoutResponse.parse({ success: true }));
});

router.get("/auth/me", (req, res): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  res.json(GetCurrentUserResponse.parse(req.user));
});

export default router;