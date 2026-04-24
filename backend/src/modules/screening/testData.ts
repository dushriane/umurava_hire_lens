import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { CandidateProfile, JobSchema } from "./types";

const BATCH_START = 0;
const BATCH_SIZE = 20;
const manualCandidates: CandidateProfile[] = [];

export function loadCandidatesFromCSV(): CandidateProfile[] {
  const filePath = path.join(__dirname, "../../../../fixtures/resume_screening_dataset.csv");
  const content = fs.readFileSync(filePath, "utf-8");

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: "\t",
  });

  const csvCandidates = records.slice(BATCH_START, BATCH_START + BATCH_SIZE).map((row: any, index: number) => ({
    _id: row["Resume_ID"] ?? `kaggle_${index + 1 + BATCH_START}`,
    name: row["Name"] ?? row["name"] ?? `Candidate ${index + 1 + BATCH_START}`,
    skills: parseSkills(row["Skills"] ?? row["skills"] ?? ""),
    experienceYears: parseFloat(row["Experience (Years)"] ?? row["Experience_Years"] ?? row["experience"] ?? "0") || 0,
    education: row["Education"] ?? row["education"] ?? "Not specified",
    projects: [],
    certifications: row["Certifications"] ? row["Certifications"].split(",").map((s: string) => s.trim()) : [],
  }));

  return [...manualCandidates, ...csvCandidates];
}

function parseSkills(skillsStr: string): string[] {
  if (!skillsStr) return [];
  return skillsStr
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const testJob: JobSchema = {
  _id: "job_001",
  title: "Backend Developer",
  requiredSkills: ["Python", "Machine Learning", "SQL"],
  niceToHave: ["TensorFlow", "AWS"],
  minExperienceYears: 2,
  educationLevel: "Bachelor's or equivalent",
  shortlistSize: 5,
};

export const testCandidates = loadCandidatesFromCSV();
