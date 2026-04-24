import { screenCandidates } from "../../src/modules/screening/screenCandidates";

const testJob = {
  _id: "job_test_1",
  title: "Test Job",
  requiredSkills: ["Node.js"],
  shortlistSize: 5,
} as any;

async function run() {
  console.log("Running smoke test for screenCandidates with mock model...");

  const mockCandidates = [
    {
      _id: "cand_test_1",
      name: "Test User",
      skills: ["Node.js", "TypeScript"],
      experienceYears: 3,
      education: "BSc Computer Science",
    },
  ];

  // mock model that returns a valid JSON string
  const fakeModel = {
    generateContent: async (opts: any) => ({
      response: {
        text: () => JSON.stringify([
          {
            candidateId: "cand_test_1",
            rank: 1,
            score: 85,
            skillScore: 40,
            experienceScore: 30,
            educationScore: 15,
            relevanceScore: 85,
            strengths: ["Strong TypeScript skills"],
            gaps: ["Limited cloud exposure"],
            recommendation: "Interview",
            confidence: 90,
            explanation: "Good fit for backend role."
          }
        ])
      }
    })
  };

  const results = await screenCandidates(testJob as any, mockCandidates as any, { getModel: () => fakeModel });
  console.log("Mock screening results:", JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
