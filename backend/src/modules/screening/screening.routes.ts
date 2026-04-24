import { Router, Request, Response, NextFunction } from "express";
import { ScreeningController } from "./screening.controller";
import { requireApiKey } from "../../middleware/apiKey";
import logger from "../../utils/logger";

const router = Router();

/**
 * POST /screening/:jobId/screen
 * Trigger AI screening for a job's applicants
 * Requires API key for expensive Gemini operation
 */
router.post(
  "/:jobId/screen",
  requireApiKey,
  (req: Request, res: Response, next: NextFunction): void => {
    logger.debug("POST /screening/:jobId/screen", { jobId: req.params.jobId });
    ScreeningController.triggerScreening(req, res, next).catch(next);
  }
);

/**
 * GET /screening/:jobId
 * Retrieve screening results for a job
 */
router.get("/:jobId", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /screening/:jobId", { jobId: req.params.jobId });
  ScreeningController.getScreeningResults(req, res, next).catch(next);
});

export default router;