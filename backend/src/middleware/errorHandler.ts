import { Request, Response, NextFunction } from "express";
import config from "../config";
import logger from "../utils/logger";

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = config.server.nodeEnv === "development";

  // Log error with context
  logger.error(`[${status}] ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    ip: req.ip,
  });

  // Determine error message to send
  let message = "Internal Server Error";
  
  if (status === 400) {
    message = err.message || "Bad Request";
  } else if (status === 401) {
    message = "Unauthorized";
  } else if (status === 403) {
    message = "Forbidden";
  } else if (status === 404) {
    message = "Not Found";
  } else if (isDevelopment) {
    message = err.message;
  }

  res.status(status).json({
    error: message,
    ...(isDevelopment && { stack: err.stack, details: err.message }),
  });
}

export default errorHandler;