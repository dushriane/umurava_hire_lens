import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { JobSchema, CandidateProfile, ScreeningResult } from "./types";
import { assertApiKey } from "./screeningInput";
import { screeningResultsResponseSchema } from "./screeningSchema";

dotenv.config();

let cachedClient: GoogleGenerativeAI | null = null;
let cachedModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;
let cachedModelName: string | null = null;

function getModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

function getScreeningModel() {
  assertApiKey();
  const modelName = getModelName();
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  if (!cachedModel || cachedModelName !== modelName) {
    cachedModel = cachedClient.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: screeningResultsResponseSchema,
      },
    });
    cachedModelName = modelName;
  }
  return cachedModel;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function safeParseJSON(text: string): any[] {
  try {
    return JSON.parse(text);
  } catch (e) {
    // try to strip markdown fences
    const cleaned = text.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned);
  }
}

function dedupeByCandidateId(rows: ScreeningResult[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.candidateId)) return false;
    seen.add(r.candidateId);
    return true;
  });
}

function normalizeParsedRow(row: any, nameMap: Record<string, string>, validIds: Set<string>): ScreeningResult | null {
  if (!row || typeof row !== "object") return null;
  const id = row.candidateId ?? row.candidate_id ?? row.id;
  if (!id || !validIds.has(id)) return null;
  return {
    candidateId: String(id),
    rank: Number(row.rank || 0),
    score: Number(row.score || 0),
    skillScore: Number(row.skillScore || 0),
    experienceScore: Number(row.experienceScore || 0),
    educationScore: Number(row.educationScore || 0),
    relevanceScore: Number(row.relevanceScore || 0),
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    gaps: Array.isArray(row.gaps) ? row.gaps : [],
    recommendation: String(row.recommendation || "Consider"),
    confidence: Number(row.confidence || 80),
    explanation: String(row.explanation || ""),
    candidateName: nameMap[String(id)] ?? row.candidateName ?? "Unknown",
  } as ScreeningResult;
}

function sanitise(c: CandidateProfile) {
  return {
    candidateId: c._id,
    skills: c.skills,
    experienceYears: c.experienceYears,
    education: c.education,
    projects: c.projects ?? [],
    certifications: c.certifications ?? [],
  };
}

function buildPrompt(job: JobSchema, candidates: object[]) {
  return `
You are an expert, unbiased technical recruiter AI.
Evaluate candidates ONLY on skills, experience, and qualifications.
IGNORE all demographic signals: name, nationality, age, gender.
Return ONLY valid JSON — no markdown, no preamble.

JOB REQUIREMENTS:
${JSON.stringify(job)}

CANDIDATES:
${JSON.stringify(candidates)}
`;
}

export async function screenCandidates(
  job: JobSchema,
  candidates: CandidateProfile[],
  overrides?: { getModel?: () => any }
): Promise<ScreeningResult[]> {
  if (candidates.length === 0) return [];

  const nameMap: Record<string, string> = {};
  candidates.forEach((c) => {
    nameMap[c._id] = c.name;
  });

  const batches = chunkArray(candidates, 25);
  let allResults: ScreeningResult[] = [];

  for (const batch of batches) {
    const validIds = new Set(batch.map((c) => c._id));
    const sanitised = batch.map(sanitise);
    const prompt = buildPrompt(job, sanitised);
    const model = overrides?.getModel ? overrides.getModel() : getScreeningModel();

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.response.text();
      const parsed = safeParseJSON(text);
      const normalized = parsed
        .map((row) => normalizeParsedRow(row, nameMap, validIds))
        .filter((r): r is ScreeningResult => r !== null);
      const deduped = dedupeByCandidateId(normalized);
      allResults = [...allResults, ...deduped];
    } catch (err) {
      console.error(`Gemini batch failed (model ${getModelName()}):`, err);
    }
  }

  return allResults
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      candidateName: nameMap[r.candidateId] ?? r.candidateName ?? "Unknown",
    }))
    .slice(0, job.shortlistSize ?? 10);
}
