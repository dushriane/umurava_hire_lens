import { Router } from "express";
import { ApplicantController } from "./applicant.controller";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", ApplicantController.getAllApplicants);

// GET /applicants/detail/:id - single applicant (place BEFORE /:jobId)
router.get("/detail/:id", ApplicantController.getApplicantById);

// GET /applicants/:jobId - applicants for a job
router.get("/:jobId", ApplicantController.getApplicantsByJob);

// POST /applicants - create applicant (JSON)
router.post("/", ApplicantController.createApplicant);

// POST /applicants/upload - file upload (PDF/CSV)
router.post("/upload", upload.single("file"), ApplicantController.uploadApplicantFile);

export default router;
