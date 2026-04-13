import { application } from "express";
import mongoose, {Document, Schema} from "mongoose"

export interface ICandidateResult {
    applicantId: mongoose.Types.ObjectId;
    score: number;
    rank: number;
    strengths: string[];
    gaps: string[],
    recommendation: string;
    confidence: number; //number or string? to think about
}
export interface IResult extends Document{
    jobId: mongoose.Types.ObjectId;
    candidates: ICandidateResult[];
    createdAt: Date;
    updatedAt: Date;
}

const ResultSchema: Schema = new Schema(
    {
        jobId:{
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        candidates: [
            {
                applicantId:{
                    type: Schema.Types.ObjectId,
                    ref: "Applicant",
                    required: true,
                },
                score:{
                    type: Number,
                    required: true,
                },
                rank:{
                    type: Number,
                    required: true,
                },
                strengths:[{
                    type: String,
                }],
                gaps:[{
                    type: String,
                }],
                recommendation:{
                    type: String,
                },
                confidence:{
                    type: Number,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Result = mongoose.model<IResult>("Result", ResultSchema);