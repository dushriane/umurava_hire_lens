import { Types } from "mongoose";

/**
 * Job posting schema for screening context
 * Matches IJob model but excludes non-screening fields
 */
export interface JobSchema {
  _id: Types.ObjectId | string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  requiredSkills: string[];
  niceToHave?: string[];
  minExperienceYears: number;
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  educationLevel?: string;
  shortlistSize: number;
  status: "open" | "closed" | "filled" | "on-hold";
  createdAt?: Date;
}

/**
 * Candidate profile for screening evaluation
 * Maps from Applicant model
 */
export interface CandidateProfile {
  _id: Types.ObjectId | string;
  jobId: Types.ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  education: string;
  resumeUrl?: string;
  projects?: string[];
  certifications?: string[];
  languages?: string[];
  appliedAt: Date;
}

/**
 * AI screening result for a candidate against a job
 * Returned by Gemini API
 */
export interface ScreeningResult {
  jobId: Types.ObjectId | string;
  candidateId: Types.ObjectId | string;
  candidateName: string;
  candidateEmail: string;
  rank: number;
  score: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  relevanceScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: "Hire" | "Interview" | "Consider" | "Reject";
  confidence: number;
  explanation: string;
  createdAt: Date;
}

/**
 * Batch screening request payload
 */
export interface ScreeningRequestPayload {
  job: JobSchema;
  candidates: CandidateProfile[];
}

/**
 * Batch screening response from AI
 */
export interface ScreeningResponsePayload {
  jobId: string;
  timestamp: Date;
  results: ScreeningResult[];
  totalCandidates: number;
  processedCandidates: number;
  errors?: Array<{
    candidateId: string;
    error: string;
  }>;
}