import mongoose, { Document, Schema } from "mongoose";

/**
 * Individual candidate screening result
 * Maps to ScreeningResult from screening/types.ts
 */
export interface ICandidateResult {
  candidateId: mongoose.Types.ObjectId | string;
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
  confidence: number; // 0-1
  explanation: string;
}

/**
 * Batch screening results for a job
 * Stores ranked candidates with AI assessment
 */
export interface IResult extends Document {
  jobId: mongoose.Types.ObjectId;
  candidates: ICandidateResult[];
  totalCandidates: number;
  processedCandidates: number;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateResultSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skillScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    experienceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    educationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    relevanceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strengths: [
      {
        type: String,
        required: true,
      },
    ],
    gaps: [
      {
        type: String,
        required: true,
      },
    ],
    recommendation: {
      type: String,
      enum: ["Hire", "Interview", "Consider", "Reject"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ResultSchema: Schema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidates: [CandidateResultSchema],
    totalCandidates: {
      type: Number,
      required: true,
      min: 0,
    },
    processedCandidates: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by jobId
ResultSchema.index({ jobId: 1, createdAt: -1 });

export const Result = mongoose.model<IResult>("Result", ResultSchema);