import { Request, Response } from "express";
import { AIService } from "./ai.service";

export class ScreeningController {
  /**
   * POST /screening/:jobId/screen
   * Trigger the AI to screen pending applicants for a specific job
   */
  public static async triggerScreening(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const result = await AIService.runScreening(jobId);
      
      res.status(200).json({
        message: "Screening completed successfully.",
        result
      });
    } catch (error: any) {
      if (error.message.includes("No pending applicants") || error.message.includes("Job not found")) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error triggering screening:", error);
        res.status(500).json({ error: "Internal Server Error during AI screening." });
      }
    }
  }

  /**
   * GET /screening/:jobId
   * Fetch the saved screening shortlist/ranking for a job
   */
  public static async getScreeningResults(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const result = await AIService.getResultsByJob(jobId);

      if (!result) {
        res.status(404).json({ error: "No screening results found for this job yet." });
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching results:", error);
      res.status(500).json({ error: "Internal Server Error." });
    }
  }
}