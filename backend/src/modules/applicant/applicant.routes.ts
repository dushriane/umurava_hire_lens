import { Router, Request, Response, NextFunction } from "express";
import { ApplicantController } from "./applicant.controller";
import multer from "multer";
import logger from "../../utils/logger";

const router = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - must match controller

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Multer error handler
const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    logger.warn("Multer error", { error: err.code, field: err.field });
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  next(err);
};

// GET all applicants (with pagination)
router.get("/", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /applicants", { query: req.query });
  ApplicantController.getAllApplicants(req, res).catch(next);
});

// GET single applicant by ID (must be BEFORE /:jobId)
router.get("/detail/:id", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /applicants/detail/:id", { id: req.params.id });
  ApplicantController.getApplicantById(req, res).catch(next);
});

// GET applicants for a job
router.get("/:jobId", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("GET /applicants/:jobId", { jobId: req.params.jobId, query: req.query });
  ApplicantController.getApplicantsByJob(req, res).catch(next);
});

// POST create single applicant (JSON)
router.post("/", (req: Request, res: Response, next: NextFunction): void => {
  logger.debug("POST /applicants", { name: req.body.name });
  ApplicantController.createApplicant(req, res).catch(next);
});

// POST file upload (PDF/CSV) - must be BEFORE generic catch-all
router.post("/upload", upload.single("file"), handleUploadError, (req: Request, res: Response, next: NextFunction): void => {
  logger.info("POST /applicants/upload", { file: req.file?.originalname, jobId: req.body.jobId });
  ApplicantController.uploadApplicantFile(req, res).catch(next);
});

export default router;