import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "../job/job.model";
import { Applicant } from "../applicant/applicant.model";
import { Result } from "./result.model";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class AIService {
  /**
   * Orchestrates the screening logic by grabbing job and applicant data,
   * asking Gemini to score/rank them, and storing the results.
   */
  public static async runScreening(jobId: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in your .env file!");
    }

    // 1. Fetch Job
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // 2. Fetch Applicants
    const applicants = await Applicant.find({ jobId, status: "pending" });
    if (!applicants.length) {
      throw new Error("No pending applicants found for this job");
    }

    // 3. Prepare Prompt Data
    const jobData = {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills
    };

    // Only send the necessary applicant details to save token context
    const applicantsData = applicants.map((app, index) => ({
      internalId: app._id,
      index, // to help AI keep track
      firstName: app.firstName,
      lastName: app.lastName,
      skills: app.skills,
      experience: app.experience,
      parsedText: (app as any).parsedText // resume context
    }));

    const prompt = `
      You are an expert technical recruiter and ATS screening engine.
      Evaluate the following applicants against the provided job description.
      
      JOB DESCRIPTION:
      ${JSON.stringify(jobData)}

      APPLICANTS:
      ${JSON.stringify(applicantsData)}

      Return ONLY a raw JSON array (no markdown code blocks, no backticks).
      Each object must match this schema:
      {
        "applicantId": "string (the exact internalId provided)",
        "score": number (0-100 overall match),
        "rank": number (1 is best),
        "strengths": ["string"],
        "gaps": ["string"],
        "recommendation": "string (Short summary of why they fit or don't)",
        "confidence": "number (0-100 on how confident you are in this match based on data provided)"
      }
    `;

    try {
      // 4. Send to Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(prompt);
      const textResponse = response.response.text();
      
      // Clean markdown if Gemini accidentally included it
      const cleanedResponse = textResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const aiResults = JSON.parse(cleanedResponse);

      // 5. Store / Update Results in MongoDB
      const candidateResults = aiResults.map((res: any) => ({
        applicantId: res.applicantId,
        score: res.score,
        rank: res.rank,
        strengths: res.strengths || [],
        gaps: res.gaps ? (Array.isArray(res.gaps) ? res.gaps : [res.gaps]) : [],
        recommendation: res.recommendation,
        confidence: Number(res.confidence) || 80
      }));

      // Overwrite previous results if they exist, or create new
      const savedResult = await Result.findOneAndUpdate(
        { jobId },
        {
          jobId,
          candidates: candidateResults
        },
        { new: true, upsert: true }
      );

      // 6. Update applicant statuses to 'screened'
      await Applicant.updateMany(
        { jobId, status: "pending" },
        { $set: { status: "screened" } }
      );

      return savedResult;
    } catch (error: any) {
      console.error("Gemini API or Parsing Error:", error);
      throw new Error(`Screening failed: ${error.message}`);
    }
  }

  /**
   * Fetch saved results for a given job
   */
  public static async getResultsByJob(jobId: string) {
    return await Result.findOne({ jobId }).populate("candidates.applicantId", "firstName lastName email");
  }
}