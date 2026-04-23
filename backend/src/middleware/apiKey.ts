import { Request, Response, NextFunction } from "express";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["x-api-key"] as string | undefined;
  const expected = process.env.API_KEY;
  if (!expected) {
    // If no API key configured, allow through (safer for local dev)
    return next();
  }
  if (!header || header !== expected) {
    res.status(401).json({ error: "Unauthorized - invalid x-api-key" });
    return;
  }
  next();
}
