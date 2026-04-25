import * as fs from "fs";
import * as path from "path";
import { CandidateProfile, JobSchema } from "./types";
import logger from "../../utils/logger";

const BATCH_START = 0;
const BATCH_SIZE = 20;

/**
 * Load candidates from CSV fixture file
 * Maps CSV columns to CandidateProfile interface
 */
export function loadCandidatesFromCSV(jobId: string = "job_001"): CandidateProfile[] {
  try {
    const filePath = path.join(__dirname, "../../../../fixtures/resume_screening_dataset.csv");
    const content = fs.readFileSync(filePath, "utf-8");

    // Parse CSV synchronously using a simple approach
    const lines = content.trim().split("\n");
    if (lines.length === 0) return [];

    const headers = lines[0].split("\t").map((h) => h.trim());
    const csvCandidates: CandidateProfile[] = lines
      .slice(1)
      .map((line, index) => {
        const values = line.split("\t");
        const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));

        return {
          _id: row["Resume_ID"] ?? `kaggle_${index + 1 + BATCH_START}`,
          jobId,
          name: row["Name"] ?? row["name"] ?? `Candidate ${index + 1 + BATCH_START}`,
          email: row["Email"] ?? row["email"] ?? `candidate${index + 1}@example.com`,
          phone: row["Phone"] ?? row["phone"],
          skills: parseSkills(row["Skills"] ?? row["skills"] ?? ""),
          experienceYears: parseFloat(row["Experience (Years)"] ?? row["Experience_Years"] ?? row["experience"] ?? "0") || 0,
          education: row["Education"] ?? row["education"] ?? "Not specified",
          resumeUrl: row["Resume_URL"] ?? row["resume_url"],
          projects: [],
          certifications: row["Certifications"]
            ? row["Certifications"].split(",").map((s: string) => s.trim())
            : [],
          languages: row["Languages"] ? row["Languages"].split(",").map((s: string) => s.trim()) : [],
          appliedAt: new Date(),
        };
      });

    logger.info("CSV candidates loaded", { count: csvCandidates.length });
    return csvCandidates.slice(BATCH_START, BATCH_START + BATCH_SIZE);
  } catch (error) {
    logger.error("Error loading CSV candidates", { error });
    return [];
  }
}

/**
 * Parse skills from comma/semicolon/pipe-delimited string
 */
function parseSkills(skillsStr: string): string[] {
  if (!skillsStr) return [];
  return skillsStr
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Test job for screening pipeline
 */
export const testJob: JobSchema = {
  _id: "job_001",
  title: "Backend Developer",
  description: "Senior backend developer with experience in scalable systems and microservices",
  department: "Engineering",
  location: "Remote",
  requiredSkills: ["Python", "Machine Learning", "SQL"],
  niceToHave: ["TensorFlow", "AWS"],
  minExperienceYears: 2,
  experienceLevel: "mid",
  educationLevel: "Bachelor's or equivalent",
  shortlistSize: 5,
  status: "open",
  createdAt: new Date(),
};

/**
 * Test candidates loaded from CSV
 */
export const testCandidates = loadCandidatesFromCSV(testJob._id as string);