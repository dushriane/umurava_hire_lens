import { screenCandidates } from "../../src/modules/screening/screenCandidates";

async function runScreenCandidatesMock() {
  console.log("Running screenCandidates mock test...");
  const job = {
    _id: "job_test",
    title: "Backend Engineer",
    requiredSkills: ["Node.js", "TypeScript"],
  } as any;

  const candidates = [
    { _id: "c1", name: "Alice", skills: ["Node.js"], experienceYears: 4 },
  ];

  const fakeModel = {
    generateContent: async () => ({
      response: {
        text: () => JSON.stringify([
          { candidateId: "c1", rank: 1, score: 90, recommendation: "Interview", strengths: ["Good"], gaps: [], confidence: 95 }
        ])
      }
    })
  };

  const res = await screenCandidates(job, candidates as any, { getModel: () => fakeModel });
  console.log("screenCandidates mock result:", JSON.stringify(res, null, 2));
}

async function runCheckModelsMock() {
  console.log("Running check-models mock test...");
  const commonModels = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
  ];

  for (const m of commonModels) {
    try {
      // simulate checking
      await new Promise((r) => setTimeout(r, 50));
      console.log(`✅ [AVAILABLE] ${m}`);
    } catch (e) {
      console.log(`❌ [UNAVAILABLE] ${m}`);
    }
  }
}

async function runAll() {
  await runScreenCandidatesMock();
  await runCheckModelsMock();
  console.log("All tests completed.");
}

runAll().catch((e) => { console.error(e); process.exit(1); });
