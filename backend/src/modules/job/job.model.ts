import mongoose, {Document, Schema} from "mongoose"

export interface IJob extends Document {
    title: string;
    description: string;
    requiredSkills: string[];
    experienceLevel: string;
    createdAt: Date; 
    updatedAt: Date;
}

const JobSchema: Schema = new Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        requiredSkills: [{type: String, required: true}],
        experienceLevel: {type: String, required: true},
    },
    {
        timestamps: true, //Automatically creates createdAt and updatedAt fields
    }
);

export const Job = mongoose.model<IJob>("Job", JobSchema);