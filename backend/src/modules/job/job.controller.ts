import { Request, Response, NextFunction } from "express";
import { JobService } from "./job.service";
import logger from "../../utils/logger";

export class JobController {
  /**
   * POST /jobs
   * Create a new job
   */
  public static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info("Creating job", { body: req.body });

      const job = await JobService.createJob(req.body);
      res.status(201).json(job);
    } catch (error) {
      logger.error("Error creating job", { error });
      next(error);
    }
  }

  /**
   * GET /jobs
   * Return all jobs with pagination
   */
  public static async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

      if (page < 1 || limit < 1) {
        res.status(400).json({ error: "Page and limit must be positive integers" });
        return;
      }

      const skip = (page - 1) * limit;
      const jobs = await JobService.getAllJobs(skip, limit);
      
      res.status(200).json({
        data: jobs,
        pagination: {
          page,
          limit,
          skip,
          count: jobs.length,
        },
      });
    } catch (error) {
      logger.error("Error fetching jobs", { error });
      next(error);
    }
  }

  /**
   * GET /jobs/:id
   * Return a single job by ID
   */
  public static async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      logger.info("Fetching job", { jobId: id });

      const job = await JobService.getJobById(id);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.status(200).json(job);
    } catch (error) {
      logger.error("Error fetching job", { jobId: req.params.id, error });
      next(error);
    }
  }

  /**
   * PUT /jobs/:id
   * Update a job
   */
  public static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      logger.info("Updating job", { jobId: id, body: req.body });

      const job = await JobService.updateJob(id, req.body);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.status(200).json(job);
    } catch (error) {
      logger.error("Error updating job", { jobId: req.params.id, error });
      next(error);
    }
  }

  /**
   * DELETE /jobs/:id
   * Delete a job
   */
  public static async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      logger.info("Deleting job", { jobId: id });

      const job = await JobService.deleteJob(id);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
      logger.error("Error deleting job", { jobId: req.params.id, error });
      next(error);
    }
  }
}