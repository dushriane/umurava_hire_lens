import { Request, Response, NextFunction } from "express";
import config from "../config";
import logger from "../utils/logger";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["x-api-key"];
  
  // Handle header being array or string
  const apiKey = Array.isArray(header) ? header[0] : header;
  const expectedKey = config.auth.apiKey;

  // In production, API key is required for sensitive endpoints
  if (config.server.nodeEnv === "production" && !expectedKey) {
    logger.error("⚠️  API_KEY not configured in production");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  // Development: allow if no API key configured
  if (!expectedKey) {
    logger.debug("API key validation skipped (not configured)");
    next();
    return;
  }

  // Validate API key
  if (!apiKey) {
    logger.warn(`Unauthorized request - missing x-api-key header from ${req.ip}`);
    res.status(401).json({ error: "Missing x-api-key header" });
    return;
  }

  if (apiKey !== expectedKey) {
    logger.warn(`Unauthorized request - invalid x-api-key from ${req.ip}`);
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  logger.debug(`Valid API key from ${req.ip}`);
  next();
}