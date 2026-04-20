import { Request, Response } from "express";
import { ApplicantService, IIncomingApplicant } from "./applicant.service";
import { parsePDF, parseCSV } from "../../utils/parser";

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


  public static async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      const applicants = await ApplicantService.getAllApplicants();
      res.status(200).json(applicants);
    } catch (error) {
      console.error("Error fetching all applicants:", error);
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
        try{
            if(!(req as any).file){
                res.status(400).json({error: "No file uploaded. Please upload a PDF or CSV file."});
                return;
            }
            const {jobId} = req.body;
            if(!jobId){
                res.status(400).json({error:"jobId is required when uploading a file"});
                return;
            }

            const file = (req as any).file
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

            // handle pdf upload
            if (fileExtension === "pdf"){
                const parsedText = await parsePDF(file.buffer);

                const data: IIncomingApplicant={
                    jobId,
                    source: "pdf",
                    name: req.body.name || "Unknown from PDF",
                    email: req.body.email,
                    skills: [],
                    parsedText,
                };

                const {applicant, duplicate} = await ApplicantService.createApplicant(data);
                res.status(201).json({message: duplicate ? "Merged": "Created", applicant});
                return;
            }

            //handle csv upload
                if (fileExtension === "csv") {
                const rows = await parseCSV(file.buffer);
                const createdApplicants = [];

                for (const row of rows) {
                    const data: IIncomingApplicant = {
                    jobId,
                    source: "csv",
                    name: row.name || row.Name || "Unknown from CSV",
                    email: row.email || row.Email,
                    phone: row.phone || row.Phone,
                    skills: row.skills ? String(row.skills).split(",") : [],
                    rawProfile: row
                    };

                    const { applicant } = await ApplicantService.createApplicant(data);
                    createdApplicants.push(applicant);
                }

                res.status(201).json({ message: `Processed ${createdApplicants.length} rows`, applicants: createdApplicants });
                return;
                }

                res.status(400).json({ error: "Unsupported file type." });
        }catch(err){
            console.error("Error processing file upload:", err);
            res.status(500).json({ error: "Internal Server Error during file upload." });
        }
    }
}


