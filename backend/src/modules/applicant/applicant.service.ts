import { Applicant, IApplicant } from "./applicant.model";
import mongoose from "mongoose";

export interface IIncomingApplicant {
  jobId: string;
  source: "umurava" | "csv" | "pdf" | "link";
  sourceId?: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experienceYears?: number;
  rawProfile?: any;
  parsedText?: string;
  linkedin?: string;
}

export class ApplicantService {
  /**
   * Helper to normalize name into firstName and lastName for the existing schema
   */
  private static parseName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(" ");
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "Unknown";
    return { firstName, lastName };
  }

  /**
   * Helper to convert string array of skills into the schema's expected format
   */
  private static parseSkills(skills: string[]): any[] {
    return skills.map((skill) => ({
      name: skill,
      level: "Intermediate", // Default level
      yearsOfExperience: 0,
    }));
  }

  /**
   * Handles deduplication, normalization, and merge logic
   */
  public static async createApplicant(data: IIncomingApplicant): Promise<{ applicant: IApplicant; duplicate: boolean }> {
    let existingApplicant: IApplicant | null = null;

    // 1. DEDUPLICATION
    if (data.email) {
      existingApplicant = await Applicant.findOne({ jobId: data.jobId, email: data.email });
    }

    // 2. HANDLE MISSING EMAIL (fallback matching)
    if (!existingApplicant && data.name) {
      const { firstName, lastName } = this.parseName(data.name);
      
      const queryPhone = data.phone ? { "contact.phone": data.phone } : null; // Assumes a phone exists, though not in schema
      const queryLinkedin = data.linkedin ? { "socialLinks.linkedin": data.linkedin } : null;

      if (queryPhone || queryLinkedin) {
        existingApplicant = await Applicant.findOne({
          jobId: data.jobId,
          firstName,
          lastName,
          $or: [queryPhone || {}, queryLinkedin || {}].filter(q => Object.keys(queryPhone || {}).length > 0)
        });
      }
    }

    // 3. MERGE LOGIC
    if (existingApplicant) {
      const mergedApplicant = await this.mergeApplicant(existingApplicant, data);
      return { applicant: mergedApplicant, duplicate: true };
    }

    // 4. CREATE NEW APPLICANT
    const { firstName, lastName } = this.parseName(data.name);
    
    // Normalize new data to fit the IApplicant schema
    const newApplicant = new Applicant({
      jobId: new mongoose.Types.ObjectId(data.jobId),
      firstName,
      lastName,
      email: data.email || `no-email-${Date.now()}@example.com`,
      skills: this.parseSkills(data.skills || []),
      source: data.source,
      sourceId: data.sourceId,
      rawProfile: data.rawProfile,
      parsedText: data.parsedText,
      status: "pending",
      socialLinks: {
        linkedin: data.linkedin
      }
    });

    await newApplicant.save();
    return { applicant: newApplicant, duplicate: false };
  }

  /**
   * Applies source priority logic for merging
   * umurava > csv > pdf
   */
  public static async mergeApplicant(existing: IApplicant, incoming: IIncomingApplicant): Promise<IApplicant> {
    const sourcePriority: Record<string, number> = {
      umurava: 3,
      csv: 2,
      pdf: 1,
      link: 0
    };

    const existingSource = (existing as any).source || "pdf"; // Default to lowest if missing
    const incomingPriority = sourcePriority[incoming.source] || 0;
    const existingPriority = sourcePriority[existingSource] || 0;

    let updated = false;

    // If incoming source has higher or equal priority, update fields
    if (incomingPriority >= existingPriority) {
      if (incoming.name) {
        const { firstName, lastName } = this.parseName(incoming.name);
        existing.firstName = firstName;
        existing.lastName = lastName;
        updated = true;
      }
      if (incoming.skills && incoming.skills.length > 0) {
        // Merge unique skills
        const existingSkillNames = new Set(existing.skills.map(s => s.name.toLowerCase()));
        incoming.skills.forEach(skill => {
          if (!existingSkillNames.has(skill.toLowerCase())) {
            existing.skills.push({ name: skill, level: "Intermediate", yearsOfExperience: 0 });
            updated = true;
          }
        });
      }
      
      // Update custom fields (may need to be added to mongoose schema loosely)
      if (incoming.rawProfile) {
        (existing as any).rawProfile = incoming.rawProfile;
        updated = true;
      }
      if (incoming.parsedText) {
        (existing as any).parsedText = incoming.parsedText;
        updated = true;
      }
      if (incoming.source) {
        (existing as any).source = incoming.source;
        updated = true;
      }
    }

    if (updated) {
      await existing.save();
    }

    return existing;
  }

  /**
   * Return all applicants for a specific job
   */
  public static async getApplicantsByJob(jobId: string): Promise<IApplicant[]> {
    return await Applicant.find({ jobId });
  }

  /**
   * Return single applicant
   */
  public static async getApplicantById(id: string): Promise<IApplicant | null> {
    return await Applicant.findById(id);
  }
}
