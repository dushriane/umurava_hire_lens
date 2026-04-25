import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import logger from "../utils/logger";

export interface TokenPayload {
  username: string;
  name: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function verifyJwt(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"] as string | undefined;

  if (!auth) {
    logger.warn(`Missing Authorization header from ${req.ip}`);
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  if (!auth.startsWith("Bearer ")) {
    logger.warn(`Invalid Authorization header format from ${req.ip}`);
    res.status(401).json({ error: "Invalid Authorization header format" });
    return;
  }

  const token = auth.slice("Bearer ".length);

  if (!config.auth.jwtSecret) {
    logger.error("JWT_SECRET not configured in environment");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
    req.user = payload;
    logger.debug(`Valid JWT token for user: ${payload.username}`);
    next();
  } catch (e) {
    let message = "Invalid token";
    
    if (e instanceof jwt.TokenExpiredError) {
      message = "Token has expired";
      logger.warn(`Expired token from ${req.ip}`);
    } else if (e instanceof jwt.JsonWebTokenError) {
      message = "Malformed token";
      logger.warn(`Malformed token from ${req.ip}: ${e.message}`);
    } else {
      logger.warn(`Token verification failed from ${req.ip}`);
    }

    res.status(401).json({ error: message });
  }
}