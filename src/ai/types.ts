export interface JobSchema {
  _id: string;
  title: string;
  requiredSkills: string[];
  niceToHave?: string[];
  minExperienceYears: number;
  educationLevel?: string;
  shortlistSize: number;
}

export interface CandidateProfile {
  _id: string;
  name: string;
  skills: string[];
  experienceYears: number;
  education: string;
  projects?: string[];
  certifications?: string[];
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
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
}