import config from "../config";

type LogContext = Record<string, any>;

/**
 * Simple logger wrapper with structured logging support
 * Can be extended or swapped with winston, pino, or DataDog
 * Respects NODE_ENV for filtering (debug logs only in development)
 */
const logger = {
  /**
   * Log a message with optional context
   */
  log: (message: string, context?: LogContext): void => {
    const timestamp = new Date().toISOString();
    const output = context
      ? `[${timestamp}] [LOG] ${message} ${JSON.stringify(context)}`
      : `[${timestamp}] [LOG] ${message}`;
    console.log(output);
  },

  /**
   * Info level - always logged
   */
  info: (message: string, context?: LogContext): void => {
    const timestamp = new Date().toISOString();
    const output = context
      ? `[${timestamp}] [INFO] ${message} ${JSON.stringify(context)}`
      : `[${timestamp}] [INFO] ${message}`;
    console.info(output);
  },

  /**
   * Warning level - always logged
   */
  warn: (message: string, context?: LogContext): void => {
    const timestamp = new Date().toISOString();
    const output = context
      ? `[${timestamp}] [WARN] ${message} ${JSON.stringify(context)}`
      : `[${timestamp}] [WARN] ${message}`;
    console.warn(output);
  },

  /**
   * Error level - always logged with error details
   */
  error: (message: string, context?: LogContext): void => {
    const timestamp = new Date().toISOString();
    const contextWithError = {
      ...context,
      stack: context?.error?.stack,
    };
    const output = context
      ? `[${timestamp}] [ERROR] ${message} ${JSON.stringify(contextWithError, null, 2)}`
      : `[${timestamp}] [ERROR] ${message}`;
    console.error(output);
  },

  /**
   * Debug level - only logged in development
   */
  debug: (message: string, context?: LogContext): void => {
    if (config.server.nodeEnv !== "production") {
      const timestamp = new Date().toISOString();
      const output = context
        ? `[${timestamp}] [DEBUG] ${message} ${JSON.stringify(context)}`
        : `[${timestamp}] [DEBUG] ${message}`;
      console.debug(output);
    }
  },
};

export default logger;