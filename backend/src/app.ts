import express, { Request, Response} from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import config from "./config";
import logger from "./utils/logger";

import authRoutes from "./modules/auth/auth.routes";
import jobRoutes from "./modules/job/job.routes";
import applicantRoutes from "./modules/applicant/applicant.routes";
import screeningRoutes from "./modules/screening/screening.routes";

import { verifyJwt } from "./middleware/authJwt";
import errorHandler from "./middleware/errorHandler";

// Extend Express Request with user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

//Initialize app
const app = express();

// Connect to database
connectDB().catch((err) => {
    logger.error("Failed to connect to database:", { error: err });
    process.exit(1);
});

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Routes
app.use("/api/v1/auth", authRoutes);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Umurava Hire Lens API is running" });
});

// Protected Profile Route
app.get("/api/v1/profile", verifyJwt, (req, res) => {
  res.json({ user: (req as any).user });
});

// Business Routes
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applicants", applicantRoutes);
app.use("/api/v1/screening", screeningRoutes);

// 404 Handler (before error middleware)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

// Error Handling (must be last)
app.use(errorHandler);

// Start the server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${config.server.nodeEnv} mode on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection:", { error: err });
  process.exit(1);
});

export default app;
