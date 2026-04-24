import { screenCandidates } from "../../src/modules/screening/screenCandidates";
import { createMockGeminiModel, defaultMockScreeningResponse } from "../mocks/geminiModel";

const testJob = {
  _id: "job_test_1",
  title: "Test Backend Engineer Role",
  requiredSkills: ["Node.js", "TypeScript"],
  niceToHave: ["Docker", "PostgreSQL"],
  minExperienceYears: 2,
  educationLevel: "Bachelor's or equivalent",
  shortlistSize: 5,
};

const mockCandidates = [
  {
    _id: "cand_test_1",
    name: "Test User",
    skills: ["Node.js", "TypeScript"],
    experienceYears: 3,
    education: "BSc Computer Science",
  },
];

async function run(): Promise<void> {
  console.log("🧪 Running smoke test for screenCandidates...\n");

  try {
    // Test 1: Success case with mock model
    console.log("Test 1: Valid screening with mock model");
    const mockModel = createMockGeminiModel(defaultMockScreeningResponse);
    const results = await screenCandidates(testJob as any, mockCandidates as any, { getModel: () => mockModel });

    if (!results || results.length === 0) {
      throw new Error("Expected results, got empty array");
    }

    console.log(`✅ Received ${results.length} result(s)\n`);
    console.log("Sample result:", JSON.stringify(results[0], null, 2));

    // Test 2: Validate result structure
    console.log("\nTest 2: Validating result structure");
    const result = results[0];
    const requiredFields = ["candidateId", "rank", "score", "recommendation"];
    const missing = requiredFields.filter((f) => !(f in result));

    if (missing.length > 0) {
      throw new Error(`Missing fields: ${missing.join(", ")}`);
    }
    console.log(`✅ All required fields present\n`);

    // Test 3: Error scenario
    console.log("Test 3: Testing error handling");
    const errorModel = createMockGeminiModel({}, true);
    try {
      await screenCandidates(testJob as any, mockCandidates as any, { getModel: () => errorModel });
      console.log("❌ Error: Should have thrown an error");
      process.exit(1);
    } catch (e: any) {
      if (e.message.includes("Mock Gemini API error")) {
        console.log("✅ Error handling works as expected\n");
      } else {
        throw e;
      }
    }

    console.log("✅ All smoke tests passed!");
  } catch (e) {
    console.error("\n❌ Smoke test failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

run();