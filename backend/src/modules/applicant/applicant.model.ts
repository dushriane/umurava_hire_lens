import mongoose, { Document, Schema } from "mongoose";

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: {
    name: string;
    level?: string;
    yearsOfExperience?: number;
  }[];
  languages: {
    name: string;
    proficiency?: string;
  }[];
  experience: {
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
    isCurrent: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
  }[];
  projects: {
    name: string;
    description?: string;
    technologies?: string[];
    role?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  }[];
  availability: {
    status?: string;
    type?: string;
    startDate?: string;
  };
  socialLinks: {
    linkedin?: string;
    github?: string;
  };
  screeningStatus?: "pending" | "screened" | "rejected" | "accepted";
  screeningResult?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema: Schema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    headline: { type: String },
    bio: { type: String },
    location: { type: String },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String },
        yearsOfExperience: { type: Number },
      },
    ],
    languages: [
      {
        name: { type: String, required: true },
        proficiency: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        isCurrent: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String },
        technologies: [{ type: String }],
        role: { type: String },
        link: { type: String },
        startDate: { type: String },
        endDate: { type: String },
      },
    ],
    availability: {
      status: { type: String },
      type: { type: String },
      startDate: { type: String },
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
    },
    screeningStatus: {
      type: String,
      enum: ["pending", "screened", "rejected", "accepted"],
      default: "pending",
    },
    screeningResult: {
      type: Schema.Types.ObjectId,
      ref: "ScreeningResult",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for job and email
ApplicantSchema.index({ jobId: 1, email: 1 });

export const Applicant = mongoose.model<IApplicant>("Applicant", ApplicantSchema);