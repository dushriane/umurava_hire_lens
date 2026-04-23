import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }
  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || process.env.API_KEY || "dev-secret");
    (req as any).user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
}
