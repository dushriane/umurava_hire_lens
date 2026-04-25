import { Request, Response, NextFunction } from "express";
import { AIService } from "./ai.service";
import logger from "../../utils/logger";
import mongoose from "mongoose";

export class ScreeningController {
  /**
   * POST /screening/:jobId/screen
   * Trigger AI screening for pending applicants of a job
   * @returns Screening results with ranked candidates
   */
  public static async triggerScreening(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const jobId = String(req.params.jobId);

      // Validate jobId format
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ error: "Invalid job ID format" });
        return;
      }

      logger.info("Triggering candidate screening", { jobId });

      const result = await AIService.runScreening(jobId);

      logger.info("Screening completed successfully", {
        jobId,
        resultsCount: (result as any)?.screeningResults?.length || 0,
      });

      res.status(200).json({
        message: "Screening completed successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error triggering screening", {
        jobId: String(req.params.jobId),
        error,
      });
      next(error);
    }
  }

  /**
   * GET /screening/:jobId
   * Retrieve saved screening results (shortlist/ranking) for a job
   * @returns Ranking and hiring recommendations
   */
  public static async getScreeningResults(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const jobId = String(req.params.jobId);

      // Validate jobId format
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ error: "Invalid job ID format" });
        return;
      }

      logger.info("Fetching screening results", { jobId });

      const result = await AIService.getResultsByJob(jobId);

      if (!result) {
        logger.warn("No screening results found", { jobId });
        res.status(404).json({ error: "No screening results found for this job yet" });
        return;
      }

      logger.info("Screening results retrieved", {
        jobId,
        resultsCount: (result as any)?.screeningResults?.length || 0,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error fetching screening results", {
        jobId: String(req.params.jobId),
        error,
      });
      next(error);
    }
  }
}