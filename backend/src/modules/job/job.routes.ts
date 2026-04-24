import { Router, Request, Response, NextFunction } from "express";
import { JobController } from "./job.controller";
import { verifyJwt } from "../../middleware/authJwt";
import logger from "../../utils/logger";

const router = Router();

// POST /jobs - Create a new job (requires auth)
router.post("/", verifyJwt, (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("POST /jobs", { title: req.body.title });
  JobController.createJob(req, res, next).catch(next);
});

// GET /jobs - Return all jobs (with pagination)
router.get("/", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /jobs", { query: req.query });
  JobController.getAllJobs(req, res, next).catch(next);
});

// GET /jobs/:id - Return a single job by ID
router.get("/:id", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /jobs/:id", { id: req.params.id });
  JobController.getJobById(req, res, next).catch(next);
});

// PUT /jobs/:id - Update an existing job (requires auth)
router.put("/:id", verifyJwt, (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("PUT /jobs/:id", { id: req.params.id });
  JobController.updateJob(req, res, next).catch(next);
});

// DELETE /jobs/:id - Delete a job (requires auth)
router.delete("/:id", verifyJwt, (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("DELETE /jobs/:id", { id: req.params.id });
  JobController.deleteJob(req, res, next).catch(next);
});

export default router;