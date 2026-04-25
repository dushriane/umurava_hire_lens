// ============================================================
// UMURAVA AI HACKATHON — Global TypeScript Types
// These types are shared across Redux slices, API calls, and UI
// ============================================================

// ------------------------------------------------------------
// ENUMS
// ------------------------------------------------------------

export type JobStatus = 'active' | 'screening' | 'closed' | 'draft'
export type JobType   = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'
export type ApplicantSource = 'umurava' | 'external'
export type ScreeningStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

// ------------------------------------------------------------
// JOB
// ------------------------------------------------------------

export interface Job {
  id: string
  title: string
  department: string
  type: JobType
  location: string
  experienceLevel: ExperienceLevel
  salaryRange: string
  description: string
  requiredSkills: string[]
  educationRequirements: string
  idealCandidateProfile: string
  status: JobStatus
  applicantCount: number
  postedDate: string          // ISO date string
  createdAt: string
  updatedAt: string
}

// What the Create Job form submits (no id/dates yet)
export interface CreateJobPayload {
  title: string
  department: string
  type: JobType
  location: string
  experienceLevel: ExperienceLevel
  salaryRange: string
  description: string
  requiredSkills: string[]
  educationRequirements: string
  idealCandidateProfile: string
}

// ------------------------------------------------------------
// APPLICANT — Umurava Profile Schema (as provided by Umurava)
// ------------------------------------------------------------

export interface UmuravaProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  location: string
  yearsOfExperience: number
  currentRole?: string
  skills: string[]
  education: {
    degree: string
    field: string
    institution: string
    graduationYear: number
  }[]
  workHistory: {
    title: string
    company: string
    startDate: string
    endDate?: string         // undefined = current role
    description: string
  }[]
  certifications: string[]
  portfolioUrl?: string
  githubUrl?: string
  linkedinUrl?: string
  profileCompleteness: number  // 0–100
  source: 'umurava'
}

// External applicant — from CSV/Excel upload or PDF resume
export interface ExternalApplicant {
  id: string
  fullName: string
  email: string
  location?: string
  yearsOfExperience?: number
  skills: string[]
  resumeUrl?: string          // PDF link
  parsedResumeText?: string   // after AI parsing
  source: 'external'
}

// Union type — an applicant can be either
export type Applicant = UmuravaProfile | ExternalApplicant

// ------------------------------------------------------------
// SCREENING
// ------------------------------------------------------------

export interface ScreeningSettings {
  jobId: string
  applicantIds: string[]
  shortlistSize: 5 | 10 | 20
  weights: {
    skills: number        // percentage, e.g. 40
    experience: number    // percentage, e.g. 35
    education: number     // percentage, e.g. 15
    relevance: number     // percentage, e.g. 10
  }
}

// What Gemini AI returns per candidate
export interface ShortlistedCandidate {
  rank: number
  applicantId: string
  applicantName: string
  applicantLocation: string
  applicantSource: ApplicantSource
  yearsOfExperience: number
  matchScore: number          // 0–100
  reasoning: string           // natural language paragraph from Gemini
  strengths: string[]         // tags: matched skills, experience level, etc.
  gaps: string[]              // tags: missing skills or requirements
  recommendation: string      // one-line final verdict
}

// Full screening result for a job
export interface ScreeningResult {
  id: string
  jobId: string
  jobTitle: string
  totalScreened: number
  shortlistSize: number
  shortlist: ShortlistedCandidate[]
  averageScore: number
  topScore: number
  screenedAt: string          // ISO date string
  settings: ScreeningSettings
}

// ------------------------------------------------------------
// API RESPONSE SHAPES
// Standardized so frontend always knows what to expect
// ------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  statusCode: number
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ------------------------------------------------------------
// REDUX SLICE STATE SHAPES
// ------------------------------------------------------------

export interface JobsState {
  list: Job[]
  selectedJob: Job | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  // for the create/edit form
  formDraft: Partial<CreateJobPayload>
}

export interface ApplicantsState {
  byJobId: Record<string, Applicant[]>   // keyed by jobId
  selected: string[]                      // selected applicant IDs for screening
  uploadStatus: 'idle' | 'uploading' | 'succeeded' | 'failed'
  parseStatus: 'idle' | 'parsing' | 'succeeded' | 'failed'
  error: string | null
}

export interface ScreeningState {
  currentSettings: ScreeningSettings | null
  results: Record<string, ScreeningResult>  // keyed by jobId
  status: ScreeningStatus
  activeJobId: string | null
  error: string | null
}

// ------------------------------------------------------------
// ROOT STATE — what useSelector sees
// ------------------------------------------------------------

export interface RootState {
  jobs:       JobsState
  applicants: ApplicantsState
  screening:  ScreeningState
}