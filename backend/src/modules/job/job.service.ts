import mongoose from "mongoose";
import { Job, IJob } from "./job.model";
import logger from "../../utils/logger";

export interface ICreateJobDTO {
  title: string;
  description: string;
  department?: string;
  location?: string;
  requiredSkills: string[];
  niceToHave?: string[];
  minExperienceYears: number;
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  educationLevel?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  shortlistSize?: number;
}

export interface IUpdateJobDTO {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
  requiredSkills?: string[];
  niceToHave?: string[];
  minExperienceYears?: number;
  experienceLevel?: "junior" | "mid" | "senior" | "lead";
  educationLevel?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  shortlistSize?: number;
  status?: "open" | "closed" | "filled" | "on-hold";
}

export class JobService {
  /**
   * Normalize skills by trimming, converting to lowercase, and deduplicating
   */
  private static normalizeSkills(skills: string[] | undefined): string[] {
    if (!skills || !Array.isArray(skills)) return [];
    const normalized = skills
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
    return Array.from(new Set(normalized));
  }

  /**
   * Validate experienceLevel enum
   */
  private static validateExperienceLevel(level: string): "junior" | "mid" | "senior" | "lead" {
    const valid = ["junior", "mid", "senior", "lead"];
    if (!valid.includes(level.toLowerCase())) {
      throw new Error(`Invalid experienceLevel. Must be one of: ${valid.join(", ")}`);
    }
    return level.toLowerCase() as "junior" | "mid" | "senior" | "lead";
  }

  /**
   * Create a new job with validation and normalized skills
   */
  public static async createJob(data: ICreateJobDTO): Promise<IJob> {
    try {
      // Validate required fields
      if (!data.title?.trim()) {
        throw new Error("Job title is required");
      }
      if (!data.description?.trim()) {
        throw new Error("Job description is required");
      }
      if (!Array.isArray(data.requiredSkills) || data.requiredSkills.length === 0) {
        throw new Error("requiredSkills must be a non-empty array");
      }

      const normalizedRequired = this.normalizeSkills(data.requiredSkills);
      if (normalizedRequired.length === 0) {
        throw new Error("requiredSkills must contain valid non-empty strings");
      }

      // Validate and normalize experience level
      const experienceLevel = this.validateExperienceLevel(data.experienceLevel || "junior");

      const job = new Job({
        title: data.title.trim(),
        description: data.description.trim(),
        department: data.department?.trim(),
        location: data.location?.trim(),
        requiredSkills: normalizedRequired,
        niceToHave: this.normalizeSkills(data.niceToHave),
        minExperienceYears: Math.max(0, data.minExperienceYears || 0),
        experienceLevel,
        educationLevel: data.educationLevel?.trim(),
        salaryRange: data.salaryRange,
        shortlistSize: Math.min(100, Math.max(1, data.shortlistSize || 5)),
        status: "open",
      });

      const saved = await job.save();
      logger.info("Job created", { jobId: saved._id, title: saved.title });
      return saved;
    } catch (error) {
      logger.error("Error creating job", { error });
      throw error;
    }
  }

  /**
   * Get all jobs with pagination
   */
  public static async getAllJobs(skip: number = 0, limit: number = 20): Promise<IJob[]> {
    try {
      return await Job.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error("Error fetching jobs", { error });
      throw error;
    }
  }

  /**
   * Get a single job by ID
   */
  public static async getJobById(id: string): Promise<IJob | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid job ID format");
      }
      return await Job.findById(id);
    } catch (error) {
      logger.error("Error fetching job", { jobId: id, error });
      throw error;
    }
  }

  /**
   * Update a job
   */
  public static async updateJob(id: string, data: IUpdateJobDTO): Promise<IJob | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid job ID format");
      }

      const updateData: Partial<IJob> = {};

      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.department !== undefined) updateData.department = data.department.trim();
      if (data.location !== undefined) updateData.location = data.location.trim();
      if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel.trim();

      if (data.requiredSkills !== undefined) {
        const normalized = this.normalizeSkills(data.requiredSkills);
        if (normalized.length === 0) {
          throw new Error("requiredSkills must contain valid non-empty strings");
        }
        updateData.requiredSkills = normalized;
      }

      if (data.niceToHave !== undefined) {
        updateData.niceToHave = this.normalizeSkills(data.niceToHave);
      }

      if (data.minExperienceYears !== undefined) {
        updateData.minExperienceYears = Math.max(0, data.minExperienceYears);
      }

      if (data.experienceLevel !== undefined) {
        updateData.experienceLevel = this.validateExperienceLevel(data.experienceLevel);
      }

      if (data.salaryRange !== undefined) {
        updateData.salaryRange = data.salaryRange;
      }

      if (data.shortlistSize !== undefined) {
        updateData.shortlistSize = Math.min(100, Math.max(1, data.shortlistSize));
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      const updated = await Job.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      if (updated) {
        logger.info("Job updated", { jobId: id });
      }
      return updated;
    } catch (error) {
      logger.error("Error updating job", { jobId: id, error });
      throw error;
    }
  }

  /**
   * Delete a job
   */
  public static async deleteJob(id: string): Promise<IJob | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid job ID format");
      }
      const deleted = await Job.findByIdAndDelete(id);
      if (deleted) {
        logger.info("Job deleted", { jobId: id });
      }
      return deleted;
    } catch (error) {
      logger.error("Error deleting job", { jobId: id, error });
      throw error;
    }
  }
}