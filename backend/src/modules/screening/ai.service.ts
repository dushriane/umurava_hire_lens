import { screenCandidates } from "./screenCandidates";
import { JobSchema, CandidateProfile, ScreeningResult } from "./types";
import { Job, IJob } from "../job/job.model";
import { Applicant, IApplicant } from "../applicant/applicant.model";
import { Result, IResult } from "./result.model";
import logger from "../../utils/logger";
import mongoose from "mongoose";

export class AIService {
  /**
   * Parse experience years from various resume formats
   */
  private static parseExperienceYears(applicant: any): number {
    // 1. Explicit numeric field
    if (typeof applicant.experienceYears === "number" && !isNaN(applicant.experienceYears)) {
      return applicant.experienceYears;
    }

    // 2. Compute from experience array with dates
    if (Array.isArray(applicant.experience) && applicant.experience.length > 0) {
      let totalMonths = 0;
      for (const item of applicant.experience) {
        const start = item?.startDate ? new Date(item.startDate) : null;
        const end = item?.endDate ? new Date(item.endDate) : null;
        if (start && !isNaN(start.getTime())) {
          const effectiveEnd = end && !isNaN(end.getTime()) ? end : new Date();
          const months =
            (effectiveEnd.getFullYear() - start.getFullYear()) * 12 +
            (effectiveEnd.getMonth() - start.getMonth());
          if (!isNaN(months) && months > 0) totalMonths += months;
        }
      }
      if (totalMonths > 0) return Math.round((totalMonths / 12) * 10) / 10;
      return applicant.experience.length; // fallback to count
    }

    // 3. Parse from resume text
    const parsedText = applicant.parsedText || applicant.rawProfile?.parsedText;
    if (parsedText) {
      const match = parsedText.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*years?/i);
      if (match) return Number(match[1]);
    }

    return 0;
  }

  /**
   * Extract name from applicant record
   */
  private static extractName(applicant: any): string {
    const firstName = applicant.firstName?.trim();
    const lastName = applicant.lastName?.trim();
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return applicant.rawProfile?.name || "Unknown";
  }

  /**
   * Extract education from applicant record
   */
  private static extractEducation(applicant: any): string {
    if (Array.isArray(applicant.education) && applicant.education.length > 0) {
      const edu = applicant.education[0];
      return edu.degree || edu.institution || "Not specified";
    }
    return applicant.education || "Not specified";
  }

  /**
   * Map Applicant to CandidateProfile for screening
   */
  private static mapToCandidateProfile(applicant: IApplicant, jobId: string): CandidateProfile {
    const skills = Array.isArray((applicant as any).skills)
      ? (applicant as any).skills.map((s: any) => (s?.name ? s.name : String(s))).filter(Boolean)
      : [];

    return {
      _id: applicant._id,
      jobId,
      name: this.extractName(applicant as any),
      email: applicant.email,
      phone: (applicant as any).phone,
      skills: skills.length > 0 ? skills : [],
      experienceYears: this.parseExperienceYears(applicant as any),
      education: this.extractEducation(applicant as any),
      resumeUrl: (applicant as any).resumeUrl,
      projects: Array.isArray((applicant as any).projects) ? (applicant as any).projects : [],
      certifications: Array.isArray((applicant as any).certifications)
        ? (applicant as any).certifications
        : [],
      languages: Array.isArray((applicant as any).languages)
        ? (applicant as any).languages
        : [],
      appliedAt: (applicant as any).createdAt || new Date(),
    };
  }

  /**
   * Map Job to JobSchema for screening
   */
  private static mapToJobSchema(job: IJob): JobSchema {
    return {
      _id: job._id,
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      requiredSkills: job.requiredSkills,
      niceToHave: job.niceToHave,
      minExperienceYears: job.minExperienceYears,
      experienceLevel: job.experienceLevel,
      educationLevel: job.educationLevel,
      shortlistSize: job.shortlistSize,
      status: job.status,
      createdAt: job.createdAt,
    };
  }

  /**
   * Run the canonical screening pipeline
   * 1. Fetch job and pending applicants
   * 2. Call Gemini AI screening
   * 3. Store results in database
   * 4. Mark applicants as screened
   */
  public static async runScreening(jobId: string): Promise<IResult> {
    try {
      logger.info("Starting screening pipeline", { jobId });

      // Validate jobId
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new Error("Invalid job ID format");
      }

      // 1. Fetch Job
      const job = await Job.findById(jobId);
      if (!job) {
        logger.error("Job not found", { jobId });
        throw new Error("Job not found");
      }

      // 2. Fetch pending Applicants
      const applicants = await Applicant.find({ jobId, screeningStatus: "pending" });
      if (!applicants || applicants.length === 0) {
        logger.warn("No pending applicants for screening", { jobId });
        throw new Error("No pending applicants found for this job");
      }

      logger.info("Fetched applicants for screening", {
        jobId,
        count: applicants.length,
      });

      // Map to screening types
      const jobSchema = this.mapToJobSchema(job);
      const candidateProfiles = applicants.map((a) => this.mapToCandidateProfile(a, jobId));

      // 3. Call canonical screening pipeline
      logger.info("Calling Gemini AI screening", { jobId, candidateCount: candidateProfiles.length });
      const screeningResults = await screenCandidates(jobSchema, candidateProfiles);

      logger.info("Screening completed", {
        jobId,
        resultsCount: screeningResults.length,
      });

      // 4. Store results in database
      const result = await Result.findOneAndUpdate(
        { jobId },
        {
          jobId,
          candidates: screeningResults,
          totalCandidates: applicants.length,
          processedCandidates: screeningResults.length,
        },
        { new: true, upsert: true }
      );

      // 5. Mark applicants as screened
      await Applicant.updateMany(
        { jobId, screeningStatus: "pending" },
        { $set: { screeningStatus: "screened" } }
      );

      logger.info("Screening pipeline completed successfully", {
        jobId,
        resultsCount: screeningResults.length,
      });

      return result as IResult;
    } catch (error) {
      logger.error("Screening pipeline failed", { jobId, error });
      throw error;
    }
  }

  /**
   * Retrieve saved screening results for a job
   */
  public static async getResultsByJob(jobId: string): Promise<IResult | null> {
    try {
      logger.info("Fetching screening results", { jobId });

      const result = await Result.findOne({ jobId }).lean();

      if (!result) {
        logger.warn("No screening results found", { jobId });
        return null;
      }

      logger.info("Screening results retrieved", {
        jobId,
        candidatesCount: (result as any).candidates?.length || 0,
      });

      return result as unknown as IResult;
    } catch (error) {
      logger.error("Error fetching screening results", { jobId, error });
      throw error;
    }
  }
}