import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Unhandled Error:", err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal Server Error";

  res.status(status).json({
    error: "Internal Server Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export default errorHandler;
