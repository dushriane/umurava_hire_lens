import { Router } from "express";
import { JobController } from "./job.controller";

const router = Router();

// POST /jobs - Create a new job
router.post("/", JobController.createJob);

// GET /jobs - Return all jobs
router.get("/", JobController.getAllJobs);

// GET /jobs/:id - Return a single job by ID
router.get("/:id", JobController.getJobById);

// PUT /jobs/:id - Update an existing job
router.put("/:id", JobController.updateJob);

// DELETE /jobs/:id - Delete a job
router.delete("/:id", JobController.deleteJob);

export default router;
