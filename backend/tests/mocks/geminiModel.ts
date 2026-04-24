/**
 * Mock factory for Gemini model used in tests.
 * Allows testing screenCandidates without network calls or API keys.
 */

export interface MockGenerativeModel {
  generateContent: (prompt: string | any) => Promise<{ response: { text: () => string } }>;
}

export function createMockGeminiModel(responseData: any, shouldError: boolean = false): MockGenerativeModel {
  return {
    generateContent: async (opts: any) => {
      if (shouldError) {
        throw new Error("Mock Gemini API error");
      }
      return {
        response: {
          text: () => JSON.stringify(responseData),
        },
      };
    },
  };
}

/**
 * Default mock response for screening results.
 * Should match the structure returned by actual Gemini screening.
 */
export const defaultMockScreeningResponse = [
  {
    candidateId: "test_id_001",
    candidateName: "Test Candidate",
    rank: 1,
    score: 85,
    skillScore: 40,
    experienceScore: 30,
    educationScore: 15,
    relevanceScore: 85,
    strengths: ["Strong technical skills", "Relevant experience"],
    gaps: ["Limited leadership experience"],
    recommendation: "Interview",
    confidence: 90,
    explanation: "Good candidate fit for the role",
  },
];

/**
 * Error response for testing error scenarios.
 */
export const errorMockScreeningResponse = {
  error: "Failed to evaluate candidates",
  details: "API error or invalid input",
};

export default createMockGeminiModel;