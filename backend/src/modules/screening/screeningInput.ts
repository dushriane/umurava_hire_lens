import type { JobSchema, CandidateProfile, ScreeningResult } from "./types";

const RECS = new Set<string>(["Hire", "Interview", "Consider", "Reject"]);

export function assertApiKey(): void {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing GEMINI_API_KEY. Add it to a .env file in the project root (from Google AI Studio)."
    );
  }
}

export function parseJobJson(data: unknown): JobSchema {
  if (!data || typeof data !== "object") {
    throw new Error("Job JSON must be an object.");
  }
  const o = data as Record<string, unknown>;
  const title = o.title;
  const requiredSkills = o.requiredSkills;
  const minExperienceYears = o.minExperienceYears;
  const shortlistSize = o.shortlistSize;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error('Job JSON needs a non-empty string "title".');
  }
  if (!Array.isArray(requiredSkills) || requiredSkills.some((s) => typeof s !== "string")) {
    throw new Error('Job JSON needs "requiredSkills" as an array of strings.');
  }
  if (typeof minExperienceYears !== "number" || minExperienceYears < 0) {
    throw new Error('Job JSON needs "minExperienceYears" as a number ≥ 0.');
  }
  if (typeof shortlistSize !== "number" || shortlistSize < 1) {
    throw new Error('Job JSON needs "shortlistSize" as an integer ≥ 1.');
  }

  return {
    _id: typeof o._id === "string" ? o._id : "job_manual",
    title: title.trim(),
    requiredSkills: requiredSkills.map((s) => String(s).trim()).filter(Boolean),
    niceToHave: Array.isArray(o.niceToHave)
      ? (o.niceToHave as unknown[]).map((s) => String(s).trim()).filter(Boolean)
      : undefined,
    minExperienceYears,
    educationLevel: typeof o.educationLevel === "string" ? o.educationLevel : undefined,
    shortlistSize: Math.floor(shortlistSize),
  };
}

export function parseCandidatesJson(data: unknown): CandidateProfile[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Candidates JSON must be a non-empty array.");
  }
  return data.map((row, i) => parseOneCandidate(row, i));
}

function parseOneCandidate(row: unknown, index: number): CandidateProfile {
  if (!row || typeof row !== "object") {
    throw new Error(`Candidate at index ${index} must be an object.`);
  }
  const o = row as Record<string, unknown>;
  const _id = o._id;
  const name = o.name;
  const skills = o.skills;
  const experienceYears = o.experienceYears;
  const education = o.education;

  if (typeof _id !== "string" || !_id.trim()) {
    throw new Error(`Candidate ${index}: "_id" must be a non-empty string.`);
  }
  if (typeof name !== "string" || !name.trim()) {
    throw new Error(`Candidate ${index}: "name" must be a non-empty string.`);
  }
  if (!Array.isArray(skills) || skills.some((s) => typeof s !== "string")) {
    throw new Error(`Candidate ${index}: "skills" must be an array of strings.`);
  }
  if (typeof experienceYears !== "number" || experienceYears < 0) {
    throw new Error(`Candidate ${index}: "experienceYears" must be a number ≥ 0.`);
  }
  if (typeof education !== "string" || !education.trim()) {
    throw new Error(`Candidate ${index}: "education" must be a non-empty string.`);
  }

  const projects = Array.isArray(o.projects)
    ? (o.projects as unknown[]).map((p) => String(p).trim()).filter(Boolean)
    : undefined;
  const certifications = Array.isArray(o.certifications)
    ? (o.certifications as unknown[]).map((p) => String(p).trim()).filter(Boolean)
    : undefined;

  return {
    _id: _id.trim(),
    name: name.trim(),
    skills: skills.map((s) => String(s).trim()).filter(Boolean),
    experienceYears,
    education: education.trim(),
    projects,
    certifications,
  };
}

export function coerceRecommendation(value: unknown): ScreeningResult["recommendation"] {
  if (typeof value === "string" && RECS.has(value)) {
    return value as ScreeningResult["recommendation"];
  }
  return "Consider";
}
