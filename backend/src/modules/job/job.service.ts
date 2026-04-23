import mongoose from "mongoose";
import { Job, IJob } from "./job.model";

export interface ICreateJobDTO {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  niceToHaveSkills?: string[];
}

export interface IUpdateJobDTO {
  title?: string;
  description?: string;
  requiredSkills?: string[];
  experienceLevel?: string;
  niceToHaveSkills?: string[];
}

export class JobService {
  /**
   * Helps normalize an array of skills by trimming, converting to lowercase,
   * and deduplicating them.
   */
  private static normalizeSkills(skills: string[] | undefined): string[] {
    if (!skills || !Array.isArray(skills)) return [];
    const normalized = skills
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
    return Array.from(new Set(normalized));
  }

  /**
   * Create a new job with validation and normalized skills
   */
  public static async createJob(data: ICreateJobDTO): Promise<IJob> {
    if (
      !data.title?.trim() ||
      !data.description?.trim() ||
      !data.requiredSkills ||
      !Array.isArray(data.requiredSkills) ||
      data.requiredSkills.length === 0
    ) {
      throw new Error(
        "Missing required fields: title, description, and a non-empty requiredSkills array."
      );
    }

    const normalizedRequiredSkills = this.normalizeSkills(data.requiredSkills);
    if (normalizedRequiredSkills.length === 0) {
      throw new Error("requiredSkills must contain valid string items.");
    }

    const job = new Job({
      title: data.title.trim(),
      description: data.description.trim(),
      requiredSkills: normalizedRequiredSkills,
      experienceLevel: data.experienceLevel?.trim() || "Entry-level",
      // Optional field; it will be saved if schema has { strict: false } 
      // or if added to job.model.ts in the future:
      niceToHaveSkills: this.normalizeSkills(data.niceToHaveSkills),
    });

    return await job.save();
  }

  /**
   * Get a list of all jobs ordered by newest first
   */
  public static async getAllJobs(): Promise<IJob[]> {
    return await Job.find().sort({ createdAt: -1 });
  }

  /**
   * Get a single job by ID
   */
  public static async getJobById(id: string): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Job ID format.");
    }
    return await Job.findById(id);
  }

  /**
   * Update an existing job with partial validation & normalization
   */
  public static async updateJob(id: string, data: IUpdateJobDTO): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Job ID format.");
    }

    const updateData: Partial<IJob & { niceToHaveSkills?: string[] }> = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel.trim();

    if (data.requiredSkills !== undefined) {
      const normalized = this.normalizeSkills(data.requiredSkills);
      if (normalized.length === 0) {
        throw new Error("requiredSkills must contain valid string items.");
      }
      updateData.requiredSkills = normalized;
    }

    if (data.niceToHaveSkills !== undefined) {
      updateData.niceToHaveSkills = this.normalizeSkills(data.niceToHaveSkills);
    }

    // `new: true` ensures the returned document contains the updated data
    return await Job.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  /**
   * Delete a job
   */
  public static async deleteJob(id: string): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Job ID format.");
    }
    return await Job.findByIdAndDelete(id);
  }
}
