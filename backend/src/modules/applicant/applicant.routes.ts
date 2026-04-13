import { Router } from "express";
import { ApplicantController } from "./applicant.controller";

const router = Router();

// POST /applicants (Accepts structured JSON, CSV parsed input, resume parsed text)
router.post("/", ApplicantController.createApplicant);

// GET /applicants/:jobId
router.get("/:jobId", ApplicantController.getApplicantsByJob);

// GET /applicants/detail/:id
router.get("/detail/:id", ApplicantController.getApplicantById);

export default router;
