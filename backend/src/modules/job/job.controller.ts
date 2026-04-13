import { Request, Response } from "express";
import { JobService } from "./job.service";

export class JobController {
  /**
   * POST /jobs
   * Create a new job
   */
  public static async createJob(req: Request, res: Response): Promise<void> {
    try {
      const job = await JobService.createJob(req.body);
      res.status(201).json(job);
    } catch (error: any) {
      if (
        error.message.includes("Missing required fields") ||
        error.message.includes("valid string items")
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error creating job:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  /**
   * GET /jobs
   * Return all jobs
   */
  public static async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await JobService.getAllJobs();
      res.status(200).json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * GET /jobs/:id
   * Return a single job by ID
   */
  public static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.id as string
      const job = await JobService.getJobById(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }
      res.status(200).json(job);
    } catch (error: any) {
      if (error.message.includes("Invalid Job ID format")) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error fetching job details:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  /**
   * PUT /jobs/:id
   * Update a job
   */
  public static async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.id as string
      const job = await JobService.updateJob(jobId, req.body);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }
      res.status(200).json(job);
    } catch (error: any) {
      if (
        error.message.includes("Invalid Job ID") ||
        error.message.includes("valid string items")
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error updating job:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  /**
   * DELETE /jobs/:id
   * Delete a job
   */
  public static async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.id as string
      const job = await JobService.deleteJob(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }
      res.status(200).json({ message: "Job deleted successfully", job });
    } catch (error: any) {
      if (error.message.includes("Invalid Job ID format")) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
}
