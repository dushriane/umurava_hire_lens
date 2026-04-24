import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "./auth.controller";
import logger from "../../utils/logger";

const router = Router();

// Simple rate limiting (in-memory, for demo; use Redis in production)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function rateLimitLogin(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && now < attempt.resetTime) {
    if (attempt.count >= MAX_ATTEMPTS) {
      logger.warn(`Rate limit exceeded for login from ${ip}`);
      res.status(429).json({ error: "Too many login attempts. Try again later." });
      return;
    }
    attempt.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  }

  next();
}

/**
 * POST /auth/login
 * Login with username and password
 */
router.post("/login", rateLimitLogin, (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("POST /auth/login", { username: req.body.username });
  
  // Validate request body
  if (!req.body.username || !req.body.password) {
    logger.warn("Login attempt with missing credentials from", { ip: req.ip });
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  AuthController.login(req, res).catch(next);
});

export default router;