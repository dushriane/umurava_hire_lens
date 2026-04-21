import { SchemaType, type Schema } from "@google/generative-ai";

/** Gemini response schema so screening output is always parseable JSON. */
export const screeningResultsResponseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      candidateId: { type: SchemaType.STRING },
      rank: { type: SchemaType.INTEGER },
      score: { type: SchemaType.NUMBER },
      skillScore: { type: SchemaType.NUMBER },
      experienceScore: { type: SchemaType.NUMBER },
      educationScore: { type: SchemaType.NUMBER },
      relevanceScore: { type: SchemaType.NUMBER },
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      gaps: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
      recommendation: {
        type: SchemaType.STRING,
        format: "enum" as const,
        enum: ["Hire", "Interview", "Consider", "Reject"],
      },
      confidence: { type: SchemaType.NUMBER },
      explanation: { type: SchemaType.STRING },
    },
    required: [
      "candidateId",
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
