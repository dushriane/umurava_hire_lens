import * as fs from "fs";
import * as path from "path";
import { connectDB } from "../src/config/db";
import { Job, IJob } from "../src/modules/job/job.model";
import { Applicant, IApplicant } from "../src/modules/applicant/applicant.model";
import logger from "../src/utils/logger";
import mongoose from "mongoose";

interface SeedJobData {
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHave?: string[];
  minExperienceYears?: number;
  experienceLevel?: "junior" | "mid" | "senior" | "lead";
  educationLevel?: string;
  shortlistSize?: number;
}

interface SeedCandidateData {
  _id?: string;
  name: string;
  email: string;
  skills: string[];
  experienceYears?: number;
  education?: string;
  phone?: string;
  languages?: string[];
}

/**
 * Validate job data has required fields
 */
function validateJobData(data: any): data is SeedJobData {
  return (
    data &&
    typeof data.title === "string" &&
    data.title.trim().length > 0 &&
    typeof data.description === "string" &&
    data.description.trim().length > 0 &&
    Array.isArray(data.requiredSkills) &&
    data.requiredSkills.length > 0
  );
}

/**
 * Validate candidate data has required fields
 */
function validateCandidateData(data: any): data is SeedCandidateData {
  return (
    data &&
    typeof data.name === "string" &&
    data.name.trim().length > 0 &&
    typeof data.email === "string" &&
    data.email.trim().length > 0 &&
    Array.isArray(data.skills) &&
    data.skills.length > 0
  );
}

/**
 * Seed database with jobs and applicants from fixture files
 */
async function seed(): Promise<void> {
  try {
    logger.info("Starting database seed");

    // Connect to database
    await connectDB();
    logger.info("Connected to database");

    // Resolve fixture paths (relative to script location)
    const fixturesDir = path.join(__dirname, "../fixtures");
    const jobPath = path.join(fixturesDir, "manual-job.json");
    const candidatesPath = path.join(fixturesDir, "manual-candidates.json");

    // Validate fixture files exist
    if (!fs.existsSync(jobPath)) {
      throw new Error(`Job fixture not found: ${jobPath}`);
    }
    if (!fs.existsSync(candidatesPath)) {
      throw new Error(`Candidates fixture not found: ${candidatesPath}`);
    }

    logger.debug("Loading fixture files", { jobPath, candidatesPath });

    // Parse fixture files
    const jobData = JSON.parse(fs.readFileSync(jobPath, "utf-8"));
    const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, "utf-8"));

    // Validate job data
    if (!validateJobData(jobData)) {
      throw new Error("Invalid job fixture data: missing required fields (title, description, requiredSkills)");
    }

    if (!Array.isArray(candidatesData) || candidatesData.length === 0) {
      throw new Error("Invalid candidates fixture data: must be non-empty array");
    }

    logger.info("Fixture files validated", {
      jobTitle: jobData.title,
      candidatesCount: candidatesData.length,
    });

    // Upsert job
    const jobPayload: Partial<IJob> = {
      title: jobData.title,
      description: jobData.description,
      requiredSkills: jobData.requiredSkills,
      niceToHave: jobData.niceToHave,
      minExperienceYears: jobData.minExperienceYears ?? 0,
      experienceLevel: jobData.experienceLevel ?? "junior",
      educationLevel: jobData.educationLevel,
      shortlistSize: jobData.shortlistSize ?? 5,
      status: "open",
    };

    const job = await Job.findOneAndUpdate({ title: jobData.title }, jobPayload, {
      upsert: true,
      new: true,
    });

    logger.info("Job upserted", { jobId: job._id, title: job.title });

    // Insert applicants
    const createdApplicants: IApplicant[] = [];
    let errors = 0;

    for (let i = 0; i < candidatesData.length; i++) {
      const candidateData = candidatesData[i];

      try {
        if (!validateCandidateData(candidateData)) {
          logger.warn("Invalid candidate data, skipping", { index: i, name: candidateData.name });
          errors++;
          continue;
        }

        // Parse name into first and last
        const nameParts = candidateData.name.trim().split(/\s+/);
        const firstName = nameParts.shift() || "Unknown";
        const lastName = nameParts.join(" ");

        // Create applicant with all fields
        const applicant = new Applicant({
            jobId: job._id,
            firstName,
            lastName,
            email: candidateData.email.toLowerCase().trim(),
            phone: candidateData.phone,
            skills: candidateData.skills,
            experienceYears: candidateData.experienceYears ?? 0,
            education: candidateData.education || "Not specified",
            languages: candidateData.languages,
            screeningStatus: "pending",
            appliedAt: new Date(),
        });

        await applicant.save();
        createdApplicants.push(applicant);

        logger.debug("Applicant created", {
          index: i,
          name: applicant.firstName,
          email: applicant.email,
        });
      } catch (err) {
        logger.error("Error creating applicant", {
          index: i,
          candidateName: candidateData.name,
          error: err,
        });
        errors++;
      }
    }

    logger.info("Seeding completed", {
      jobId: job._id,
      applicantsCreated: createdApplicants.length,
      applicantsFailed: errors,
      totalCandidates: candidatesData.length,
    });

    await mongoose.disconnect();
    logger.info("Database disconnected");
  } catch (err) {
    logger.error("Seed operation failed", { error: err });
    process.exit(1);
  }
}

// Run seed
seed();