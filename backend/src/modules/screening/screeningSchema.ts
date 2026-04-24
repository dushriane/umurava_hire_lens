import { SchemaType, type Schema } from "@google/generative-ai";

/**
 * Gemini JSON response schema for structured screening results
 * Ensures the AI returns parseable, consistent JSON with required fields
 * Note: jobId, candidateName, candidateEmail, and createdAt are added by the service layer
 */
export const screeningResultsResponseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      candidateId: {
        type: SchemaType.STRING,
        description: "Unique identifier for the candidate",
      },
      candidateName: {
        type: SchemaType.STRING,
        description: "Full name of the candidate",
      },
      candidateEmail: {
        type: SchemaType.STRING,
        description: "Email address of the candidate",
      },
      rank: {
        type: SchemaType.INTEGER,
        description: "Ranking position among all candidates (1 = best fit)",
      },
      score: {
        type: SchemaType.NUMBER,
        description: "Overall screening score (0-100)",
      },
      skillScore: {
        type: SchemaType.NUMBER,
        description: "Score based on required skills match (0-100)",
      },
      experienceScore: {
        type: SchemaType.NUMBER,
        description: "Score based on years of experience (0-100)",
      },
      educationScore: {
        type: SchemaType.NUMBER,
        description: "Score based on education level (0-100)",
      },
      relevanceScore: {
        type: SchemaType.NUMBER,
        description: "Score based on overall relevance to role (0-100)",
      },
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Key strengths relevant to the job",
      },
      gaps: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Skill or experience gaps compared to requirements",
      },
      recommendation: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["Hire", "Interview", "Consider", "Reject"],
        description: "Recommendation level for this candidate",
      },
      confidence: {
        type: SchemaType.NUMBER,
        description: "Confidence level in the recommendation (0-1)",
      },
      explanation: {
        type: SchemaType.STRING,
        description: "Detailed explanation of the screening decision",
      },
    },
    required: [
      "candidateId",
      "rank",
      "score",
      "skillScore",
      "experienceScore",
      "educationScore",
      "relevanceScore",
      "strengths",
      "gaps",
      "recommendation",
      "confidence",
      "explanation",
    ],
  },
};