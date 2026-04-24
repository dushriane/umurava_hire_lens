/**
 * Mock factory for Gemini model used in tests.
 * Allows us to test screenCandidates without network calls or API keys.
 */

export function createMockGeminiModel(responseData: any) {
  return {
    generateContent: async (opts: any) => ({
      response: {
        text: () => JSON.stringify(responseData)
      }
    })
  };
}

/**
 * Default mock response for screening results.
 */
export const defaultMockScreeningResponse = [
  {
    candidateId: "test_id",
    rank: 1,
    score: 85,
    skillScore: 40,
    experienceScore: 30,
    educationScore: 15,
    relevanceScore: 85,
    strengths: ["Strong technical skills"],
    gaps: ["Limited experience"],
    recommendation: "Interview",
    confidence: 90,
    explanation: "Good candidate fit"
  }
];

export default createMockGeminiModel;
