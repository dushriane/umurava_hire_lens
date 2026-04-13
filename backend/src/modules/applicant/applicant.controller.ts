import { Request, Response } from "express";
import { ApplicantService, IIncomingApplicant } from "./applicant.service";

export class ApplicantController {
  /**
   * POST /applicants
   * Handles ingestion of applicants from multiple sources
   */
  public static async createApplicant(req: Request, res: Response): Promise<void> {
    try {
      const data: IIncomingApplicant = req.body;

      if (!data.jobId || !data.source || !data.name) {
        res.status(400).json({ error: "Missing required fields: jobId, source, name" });
        return;
      }

      const { applicant, duplicate } = await ApplicantService.createApplicant(data);

      res.status(201).json({
        message: duplicate ? "Duplicate detected. Applicant merged successfully." : "Applicant created successfully.",
        applicant
      });
    } catch (error) {
      console.error("Error creating applicant:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * GET /applicants/:jobId
   * Returns all applicants for a specific job
   */
  public static async getApplicantsByJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const applicants = await ApplicantService.getApplicantsByJob(jobId);
      res.status(200).json(applicants);
    } catch (error) {
      console.error("Error fetching applicants by job:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * GET /applicants/detail/:id
   * Returns a single applicant by ID
   */
  public static async getApplicantById(req: Request, res: Response): Promise<void> {
    try {
      const id  = req.params.id as string;
      const applicant = await ApplicantService.getApplicantById(id);

      if (!applicant) {
        res.status(404).json({ error: "Applicant not found" });
        return;
      }

      res.status(200).json(applicant);
    } catch (error) {
      console.error("Error fetching applicant:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * POST /applicants/upload
   * Handles physical file uploads (PDF resumes or CSV lists)
   */

    public static async uploadApplicantFile(req: Request, res:Response): Promise<void>{
        
    }
}


