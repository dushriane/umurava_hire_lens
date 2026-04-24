import type { JobSchema, CandidateProfile, ScreeningResult } from "./types";
import config from "../../config";
import logger from "../../utils/logger";

const RECS = new Set<string>(["Hire", "Interview", "Consider", "Reject"]);

/**
 * Validate that GEMINI_API_KEY is configured
 * @throws Error if GEMINI_API_KEY is missing
 */
export function assertApiKey(): void {
  if (!config.gemini.apiKey) {
    logger.error("Missing GEMINI_API_KEY");
    throw new Error(
      "Missing GEMINI_API_KEY. Configure it in .env file or environment: GEMINI_API_KEY=<your-key-from-aistudio.google.com>"
    );
  }
}

/**
 * Parse and validate Job JSON from fixture or manual input
 * @param data Raw job object to parse
 * @returns Validated JobSchema
 * @throws Error if required fields are missing or invalid
 */
export function parseJobJson(data: unknown): JobSchema {
  if (!data || typeof data !== "object") {
    throw new Error("Job JSON must be an object.");
  }
  const o = data as Record<string, unknown>;
  const title = o.title;
  const description = o.description;
  const requiredSkills = o.requiredSkills;
  const experienceLevel = o.experienceLevel;
  const minExperienceYears = o.minExperienceYears;
  const shortlistSize = o.shortlistSize;
  const status = o.status;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error('Job: "title" must be a non-empty string');
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error('Job: "description" must be a non-empty string');
  }
  if (!Array.isArray(requiredSkills) || requiredSkills.some((s) => typeof s !== "string")) {
    throw new Error('Job: "requiredSkills" must be an array of strings');
  }
  if (typeof minExperienceYears !== "number" || minExperienceYears < 0) {
    throw new Error('Job: "minExperienceYears" must be a number ≥ 0');
  }
  if (typeof shortlistSize !== "number" || shortlistSize < 1 || !Number.isInteger(shortlistSize)) {
    throw new Error('Job: "shortlistSize" must be an integer ≥ 1');
  }
  if (experienceLevel && !["junior", "mid", "senior", "lead"].includes(experienceLevel as string)) {
    throw new Error('Job: "experienceLevel" must be one of: junior, mid, senior, lead');
  }
  if (status && !["open", "closed", "filled", "on-hold"].includes(status as string)) {
    throw new Error('Job: "status" must be one of: open, closed, filled, on-hold');
  }

  return {
    _id: typeof o._id === "string" ? o._id : "job_manual",
    title: title.trim(),
    description: description.trim(),
    department: typeof o.department === "string" ? o.department.trim() : undefined,
    location: typeof o.location === "string" ? o.location.trim() : undefined,
    requiredSkills: requiredSkills.map((s) => String(s).trim()).filter(Boolean),
    niceToHave: Array.isArray(o.niceToHave)
      ? (o.niceToHave as unknown[]).map((s) => String(s).trim()).filter(Boolean)
      : undefined,
    minExperienceYears,
    experienceLevel: (experienceLevel as "junior" | "mid" | "senior" | "lead") || "junior",
    educationLevel: typeof o.educationLevel === "string" ? o.educationLevel.trim() : undefined,
    shortlistSize: Math.min(100, Math.max(1, Math.floor(shortlistSize))),
    status: (status as "open" | "closed" | "filled" | "on-hold") || "open",
    createdAt: new Date(),
  };
}

/**
 * Parse and validate candidate JSON array from fixture or manual input
 * @param data Raw candidates array to parse
 * @returns Array of validated CandidateProfile objects
 * @throws Error if array is empty or contains invalid entries
 */
export function parseCandidatesJson(data: unknown, jobId: string = "job_manual"): CandidateProfile[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Candidates JSON must be a non-empty array.");
  }
  return data.map((row, i) => parseOneCandidate(row, i, jobId));
}

/**
 * Parse and validate a single candidate profile
 * @param row Raw candidate object
 * @param index Array index for error messages
 * @param jobId Job ID to associate with candidate
 * @returns Validated CandidateProfile
 * @throws Error if required fields are missing or invalid
 */
function parseOneCandidate(row: unknown, index: number, jobId: string): CandidateProfile {
  if (!row || typeof row !== "object") {
    throw new Error(`Candidate ${index}: must be an object`);
  }
  const o = row as Record<string, unknown>;
  const _id = o._id;
  const name = o.name;
  const email = o.email;
  const skills = o.skills;
  const experienceYears = o.experienceYears;
  const education = o.education;

  if (typeof _id !== "string" || !_id.trim()) {
    throw new Error(`Candidate ${index}: "_id" must be a non-empty string`);
  }
  if (typeof name !== "string" || !name.trim()) {
    throw new Error(`Candidate ${index}: "name" must be a non-empty string`);
  }
  if (typeof email !== "string" || !email.trim()) {
    throw new Error(`Candidate ${index}: "email" must be a non-empty string`);
  }
  if (!Array.isArray(skills) || skills.some((s) => typeof s !== "string")) {
    throw new Error(`Candidate ${index}: "skills" must be an array of strings`);
  }
  if (typeof experienceYears !== "number" || experienceYears < 0) {
    throw new Error(`Candidate ${index}: "experienceYears" must be a number ≥ 0`);
  }
  if (typeof education !== "string" || !education.trim()) {
    throw new Error(`Candidate ${index}: "education" must be a non-empty string`);
  }

  const projects = Array.isArray(o.projects)
    ? (o.projects as unknown[]).map((p) => String(p).trim()).filter(Boolean)
    : undefined;
  const certifications = Array.isArray(o.certifications)
    ? (o.certifications as unknown[]).map((c) => String(c).trim()).filter(Boolean)
    : undefined;
  const languages = Array.isArray(o.languages)
    ? (o.languages as unknown[]).map((l) => String(l).trim()).filter(Boolean)
    : undefined;

  return {
    _id: _id.trim(),
    jobId,
    name: name.trim(),
    email: email.trim(),
    phone: typeof o.phone === "string" ? o.phone.trim() : undefined,
    skills: skills.map((s) => String(s).trim()).filter(Boolean),
    experienceYears,
    education: education.trim(),
    resumeUrl: typeof o.resumeUrl === "string" ? o.resumeUrl.trim() : undefined,
    projects,
    certifications,
    languages,
    appliedAt: new Date(),
  };
}

/**
 * Coerce recommendation value to valid ScreeningResult type
 * @param value Raw recommendation value from AI
 * @returns Valid recommendation or "Consider" as fallback
 */
export function coerceRecommendation(value: unknown): ScreeningResult["recommendation"] {
  if (typeof value === "string" && RECS.has(value)) {
    return value as ScreeningResult["recommendation"];
  }
  logger.warn("Invalid recommendation value, using default", { value });
  return "Consider";
}