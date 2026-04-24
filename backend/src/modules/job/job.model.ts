import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  department?: string;
  location?: string;
  requiredSkills: string[];
  niceToHave?: string[];
  minExperienceYears: number;
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  educationLevel?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  shortlistSize: number;
  status: "open" | "closed" | "filled" | "on-hold";
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true,
      },
    ],
    niceToHave: [
      {
        type: String,
      },
    ],
    minExperienceYears: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      required: true,
    },
    educationLevel: {
      type: String,
      trim: true,
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
    },
    shortlistSize: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 100,
    },
    status: {
      type: String,
      enum: ["open", "closed", "filled", "on-hold"],
      default: "open",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for status and createdAt (useful for queries)
JobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>("Job", JobSchema);