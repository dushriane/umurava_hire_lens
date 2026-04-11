import mongoose, {Document, Schema} from "mongoose";

export interface IApplicant extends Document{
    jobId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    headline?: string;
    bio?: string;
    location?: string;
    skills: {
        name: string;
        level: string;
        yearsOfExperience: number;
    }[];
    language: {
        name: string;
        proficiency: string;
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
        startDate?: Date | string;
    };
    socialLinks: {
        linkedin?: string;
        github?: string;
    };
}

const ApplicantSchema: Schema = new Schema(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true},
        headline: {type: String},
        bio: {type: String},
        location: {type: String},
        skills: [
            {
                name: {type: String, required: true},
                level: {type: String},
                yearsOfExperience: {type: Number},
            },
        ],
        languages: [
            {
                name: {type: String, required: true},
                proficiency: {type: String},
            },
        ],
        experience: [
            {
                company: {type: String, required: true},
                role: {type: String, required: true},
                startDate: {type: String},
                endDate: {type: String},
                description: {type: String},
                technologies: [{type: String}],
                isCurrent: {type: Boolean, default: false},
            },
        ],
        education: [
            {
                institution: {type: String, required: true},
                degree: {type: String, required: true},
                fieldOfStudy: {type: String, required: true},
                startYear: {type: Number},
                endYear: {type: Number},
            },
        ],
        projects:[
            {
                name: {type: String, required: true},
                description: {type: String},
                technologies: {type: String},
                role: {type: String},
                link: {type: String},
                startDate: {type: String},
                endDate: {type: String},
            },
        ],
        availability: {
            status: {type: String},
            type: {type: String},
            startDate: {type: Date},
        },
        socialLinks: {
            linkedin: {type: String},
            github: {type: String},
        },
    },
    {
        timestamps: true, //Automatically add createdAt and updatedAt fields
    }
);

export const Applicant = mongoose.model<IApplicant>("Applicant", ApplicantSchema);