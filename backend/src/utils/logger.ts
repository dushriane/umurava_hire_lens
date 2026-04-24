/**
 * Simple logger wrapper for consistent formatting.
 * Can be extended or swapped with winston, pino, etc.
 */

const logger = {
  log: (message: string, ...args: any[]) => {
    console.log(`[LOG] ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
