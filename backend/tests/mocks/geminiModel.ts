import { ScreeningResult } from "../../src/modules/screening/types";

export interface MockGenerativeModel {
  generateContent(params: any): Promise<{ response: { text: () => string } }>;
}

/**
 * Default mock screening response matching ScreeningResult structure
 */
export const defaultMockScreeningResponse: ScreeningResult[] = [
  {
    jobId: "job_integration_test",
    candidateId: "c1",
    candidateName: "Test Candidate 1",
    candidateEmail: "test1@example.com",
    rank: 1,
    score: 92,
    skillScore: 95,
    experienceScore: 88,
    educationScore: 90,
    relevanceScore: 93,
    strengths: ["Strong TypeScript skills", "Docker experience", "Team player"],
    gaps: ["Limited AWS experience"],
    recommendation: "Hire",
    confidence: 0.95,
    explanation: "Excellent technical fit with strong backend fundamentals",
    createdAt: new Date(),
  },
  {
    jobId: "job_integration_test",
    candidateId: "c2",
    candidateName: "Test Candidate 2",
    candidateEmail: "test2@example.com",
    rank: 2,
    score: 78,
    skillScore: 82,
    experienceScore: 75,
    educationScore: 76,
    relevanceScore: 78,
    strengths: ["Good problem solving", "Communicative"],
    gaps: ["Less experience with microservices", "No Docker"],
    recommendation: "Interview",
    confidence: 0.82,
    explanation: "Good potential with some growth areas",
    createdAt: new Date(),
  },
];

/**
 * Error scenario mock response
 */
export const errorMockScreeningResponse: ScreeningResult[] = [];

/**
 * Create mock Gemini model for testing
 * @param responseData Custom response data (defaults to test data)
 * @param shouldError Whether to simulate error
 * @returns Mock model matching GoogleGenerativeAI interface
 */
export function createMockGeminiModel(
  responseData: ScreeningResult[] = defaultMockScreeningResponse,
  shouldError: boolean = false
): MockGenerativeModel {
  return {
    generateContent: async (params: any) => {
      if (shouldError) {
        throw new Error("Mock Gemini API error");
      }

      // Return response object with text() method that returns JSON string
      return {
        response: {
          text: () => JSON.stringify(responseData),
        },
      };
    },
  };
}

/**
 * Create error response for testing error handling
 */
export function createErrorMockGeminiModel(): MockGenerativeModel {
  return createMockGeminiModel(errorMockScreeningResponse, true);
}