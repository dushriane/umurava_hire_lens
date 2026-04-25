import { screenCandidates } from "../../src/modules/screening/screenCandidates";
import { createMockGeminiModel, defaultMockScreeningResponse, createErrorMockGeminiModel } from "../mocks/geminiModel";
import { ScreeningResult } from "../../src/modules/screening/types";

const testJob = {
  _id: "job_integration_test",
  title: "Backend Engineer",
  requiredSkills: ["Node.js", "TypeScript"],
  niceToHave: ["Docker"],
  minExperienceYears: 2,
  educationLevel: "Bachelor's or equivalent",
  shortlistSize: 5,
};

const testCandidates = [
  {
    _id: "c1",
    name: "Alice Chen",
    skills: ["Node.js", "TypeScript", "Docker"],
    experienceYears: 4,
    education: "BSc Computer Science",
  },
  {
    _id: "c2",
    name: "Bob Smith",
    skills: ["Node.js"],
    experienceYears: 2,
    education: "Bootcamp",
  },
];

async function testScreenCandidatesSuccess(): Promise<void> {
  console.log("Test 1: screenCandidates - Success case\n");

  const mockModel = createMockGeminiModel(defaultMockScreeningResponse);
  const results = await screenCandidates(testJob as any, testCandidates as any, { getModel: () => mockModel });

  if (!results || results.length === 0) {
    throw new Error("Expected results, got empty array");
  }

  const result = results[0];
  const requiredFields = ["candidateId", "rank", "score", "recommendation", "explanation"];
  const missing = requiredFields.filter((f) => !(f in result));

  if (missing.length > 0) {
    throw new Error(`Missing fields in result: ${missing.join(", ")}`);
  }

  console.log(`✅ Got ${results.length} result(s)`);
  console.log(`   Top candidate: ${result.candidateName} (Score: ${result.score}/100)\n`);
}

async function testScreenCandidatesError(): Promise<void> {
  console.log("Test 2: screenCandidates - Error handling\n");

  const errorModel = createErrorMockGeminiModel();

  const results = await screenCandidates(testJob as any, testCandidates as any, { getModel: () => errorModel });

  if (results && results.length === 0) {
    console.log("✅ Error handling works correctly - returned empty results on failure\n");
  } else {
    throw new Error("Expected empty results on error, got: " + results.length);
  }
}

async function testMultipleCandidates(): Promise<void> {
  console.log("Test 3: screenCandidates - Multiple candidates\n");

  // Return multiple results
  const multipleResults : ScreeningResult[] = [
    ...defaultMockScreeningResponse,
    {
      jobId: "job_integration_test",
      candidateId: "c2",
      candidateName: "Bob Smith",
      candidateEmail: "bob.smith@example.com",
      rank: 2,
      score: 70,
      skillScore: 30,
      experienceScore: 20,
      educationScore: 10,
      relevanceScore: 70,
      strengths: ["Motivated learner"],
      gaps: ["Limited experience"],
      recommendation: "Consider" as const,
      confidence: 0.70,
      explanation: "Potential fit with mentoring",
      createdAt: new Date(),
    } as ScreeningResult,
  ] as ScreeningResult[];

  const mockModel = createMockGeminiModel(multipleResults);
  const results = await screenCandidates(testJob as any, testCandidates as any, { getModel: () => mockModel });

  if (results.length !== 2) {
    throw new Error(`Expected 2 results, got ${results.length}`);
  }

  console.log(`✅ Got ${results.length} results`);
  results.forEach((r) => {
    console.log(`   #${r.rank}: ${r.candidateName} (${r.score}/100)`);
  });
  console.log("");
}

async function runAll(): Promise<void> {
  try {
    console.log("🧪 Running integration tests...\n");

    await testScreenCandidatesSuccess();
    await testScreenCandidatesError();
    await testMultipleCandidates();

    console.log("✅ All integration tests passed!\n");
  } catch (e) {
    console.error("❌ Test failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

runAll();