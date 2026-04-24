import express, { Request, Response, NextFunction } from "express";
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

// Connect to database
connectDB();

const app = express();

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

// Error Handling (must be last)
app.use(errorHandler);

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`Server is running in ${config.server.nodeEnv} mode on port ${PORT}`);
});

export default app;
