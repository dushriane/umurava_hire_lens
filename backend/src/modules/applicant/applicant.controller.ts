import { Request, Response } from "express";
import { ApplicantService, IIncomingApplicant } from "./applicant.service";
import { parsePDF, parseCSV } from "../../utils/parser";
import logger from "../../utils/logger";
import { isValidObjectId } from "mongoose";

const ALLOWED_FILE_TYPES = ["application/pdf", "text/csv"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class ApplicantController {
  /**
   * POST /applicants
   * Creates a single applicant from JSON data
   */
  public static async createApplicant(req: Request, res: Response): Promise<void> {
    try {
      const data: IIncomingApplicant = req.body;

      // Validate required fields
      if (!data.jobId || !data.source || !data.name) {
        logger.warn("Missing required fields in applicant creation", { data });
        res.status(400).json({ error: "Missing required fields: jobId, source, name" });
        return;
      }

      // Validate jobId format
      if (!isValidObjectId(data.jobId)) {
        logger.warn("Invalid jobId format", { jobId: data.jobId });
        res.status(400).json({ error: "Invalid jobId format" });
        return;
      }

      const { applicant, duplicate } = await ApplicantService.createApplicant(data);

      logger.info(`Applicant ${duplicate ? "merged" : "created"}`, { 
        applicantId: applicant._id, 
        jobId: data.jobId 
      });

      res.status(201).json({
        data: {
          message: duplicate 
            ? "Duplicate detected. Applicant merged successfully." 
            : "Applicant created successfully.",
          applicant,
        }
      });
    } catch (error) {
      logger.error("Error creating applicant", { error });
      res.status(500).json({ error: "Failed to create applicant" });
    }
  }

  /**
   * GET /applicants
   * Returns all applicants with pagination
   */
  public static async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const skip = (page - 1) * limit;

      logger.debug("Fetching applicants", { page, limit });

      const applicants = await ApplicantService.getAllApplicants(skip, limit);
      res.status(200).json({ data: applicants, pagination: { page, limit } });
    } catch (error) {
      logger.error("Error fetching applicants", { error });
      res.status(500).json({ error: "Failed to fetch applicants" });
    }
  }

  /**
   * GET /applicants/:jobId
   * Returns applicants for a specific job
   */
  public static async getApplicantsByJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;

      if (!isValidObjectId(jobId)) {
        res.status(400).json({ error: "Invalid jobId format" });
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const skip = (page - 1) * limit;

      logger.debug("Fetching applicants by job", { jobId, page, limit });

      const applicants = await ApplicantService.getApplicantsByJob(jobId, skip, limit);
      res.status(200).json({ data: applicants, pagination: { page, limit } });
    } catch (error) {
      logger.error("Error fetching applicants by job", { error });
      res.status(500).json({ error: "Failed to fetch applicants" });
    }
  }

  /**
   * GET /applicants/detail/:id
   * Returns a single applicant by ID
   */
  public static async getApplicantById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (!isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid applicant ID format" });
        return;
      }

      const applicant = await ApplicantService.getApplicantById(id);

      if (!applicant) {
        logger.warn("Applicant not found", { id });
        res.status(404).json({ error: "Applicant not found" });
        return;
      }

      res.status(200).json({ data: applicant });
    } catch (error) {
      logger.error("Error fetching applicant", { error });
      res.status(500).json({ error: "Failed to fetch applicant" });
    }
  }

  /**
   * POST /applicants/upload
   * Handles physical file uploads (PDF resumes or CSV lists)
   */
  public static async uploadApplicantFile(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file;
      const { jobId } = req.body;

      // Validate file presence
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Validate jobId
      if (!jobId || !isValidObjectId(jobId)) {
        logger.warn("Invalid or missing jobId", { jobId });
        res.status(400).json({ error: "Valid jobId required" });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        logger.warn("File too large", { size: file.size, max: MAX_FILE_SIZE });
        res.status(400).json({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` });
        return;
      }

      const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

      // Validate MIME type
      const isAllowedMime = ALLOWED_FILE_TYPES.includes(file.mimetype) || 
                            file.mimetype === "application/vnd.ms-excel" ||
                            file.mimetype === "application/csv";
                            
      if (!isAllowedMime && fileExtension !== "csv" && fileExtension !== "pdf") {
        logger.warn("Invalid file type", { mimetype: file.mimetype, extension: fileExtension });
        res.status(400).json({ error: "Only PDF and CSV files are allowed" });
        return;
      }

      // Handle PDF upload
      if (fileExtension === "pdf") {
        try {
          const parsedText = await parsePDF(file.buffer);

          const data: IIncomingApplicant = {
            jobId,
            source: "pdf",
            name: req.body.name || "Unknown from PDF",
            email: req.body.email,
            skills: [],
            parsedText,
          };

          const { applicant, duplicate } = await ApplicantService.createApplicant(data);
          logger.info("PDF applicant processed", { applicantId: applicant._id, jobId });

          res.status(201).json({
            message: duplicate ? "Merged" : "Created",
            applicant,
          });
          return;
        } catch (error) {
          logger.error("Error parsing PDF", { error });
          res.status(400).json({ error: "Failed to parse PDF" });
          return;
        }
      }

      // Handle CSV upload
      if (fileExtension === "csv") {
        try {
          const rows = await parseCSV(file.buffer);
          const createdApplicants = [];
          const errors = [];

          for (let i = 0; i < rows.length; i++) {
            try {
              const row = rows[i];
              const data: IIncomingApplicant = {
                jobId,
                source: "csv",
                name: row.name || row.Name || `Row ${i + 1}`,
                email: row.email || row.Email,
                phone: row.phone || row.Phone,
                skills: row.skills ? String(row.skills).split(",").map((s: string) => s.trim()) : [],
                rawProfile: row,
              };

              const { applicant } = await ApplicantService.createApplicant(data);
              createdApplicants.push(applicant);
            } catch (rowError) {
              errors.push({ row: i + 1, error: rowError instanceof Error ? rowError.message : String(rowError) });
            }
          }

          logger.info("CSV processed", { jobId, created: createdApplicants.length, errors: errors.length });

          res.status(201).json({
            message: `Processed ${createdApplicants.length} rows`,
            applicants: createdApplicants,
            ...(errors.length > 0 && { errors }),
          });
          return;
        } catch (error) {
          logger.error("Error parsing CSV", { error });
          res.status(400).json({ error: "Failed to parse CSV" });
          return;
        }
      }

      res.status(400).json({ error: "Unsupported file type" });
    } catch (error) {
      logger.error("Error processing file upload", { error });
      res.status(500).json({ error: "Failed to process file upload" });
    }
  }
}