import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobSchema, CandidateProfile, ScreeningResult } from "./types";
import * as dotenv from "dotenv";
import { assertApiKey, coerceRecommendation } from "./screeningInput";
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

export async function screenCandidates(
  job: JobSchema,
  candidates: CandidateProfile[]
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
    const model = getScreeningModel();

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

/** Screen a single profile (same pipeline as batch; useful for manual HR checks). */
export async function screenSingleCandidate(
  job: JobSchema,
  candidate: CandidateProfile
): Promise<ScreeningResult | null> {
  const [first] = await screenCandidates(job, [candidate]);
  return first ?? null;
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
- Role: ${job.title}
- Required Skills: ${job.requiredSkills.join(", ")}
- Nice-to-have: ${(job.niceToHave ?? []).join(", ")}
- Min Experience: ${job.minExperienceYears} years
- Education: ${job.educationLevel ?? "any"}

SCORING WEIGHTS:
- Skills match: 50%
- Experience: 30%
- Education: 10%
- Overall relevance: 10%

CANDIDATES:
${JSON.stringify(candidates, null, 2)}

RETURN a JSON array — one object per candidate (field candidateId MUST match each input candidateId exactly):
[{
  "candidateId": "...",
  "rank": 1,
  "score": 85,
  "skillScore": 90,
  "experienceScore": 80,
  "educationScore": 75,
  "relevanceScore": 70,
  "strengths": ["specific reason 1", "specific reason 2"],
  "gaps": ["specific missing skill"],
  "recommendation": "Hire",
  "confidence": 0.88,
  "explanation": "One sentence holistic summary."
}]

RULES:
- 80-100 = Hire, 60-79 = Interview, 40-59 = Consider, below 40 = Reject
- Be SPECIFIC in gaps: "No MongoDB" not "Missing database skills"
- Include every candidate exactly once; rank ALL ${candidates.length} candidates in the array
`.trim();
}

function safeParseJSON(text: string): unknown[] {
  try {
    const clean = text
      .replace(/^```json\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();
    const extracted = extractJsonArray(clean) ?? clean;
    const parsed = JSON.parse(extracted);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const fallback = extractJsonArray(text);
    if (!fallback) {
      console.error("JSON parse failed. Raw (first 400 chars):", text.slice(0, 400));
      return [];
    }
    try {
      const parsed = JSON.parse(fallback);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.error("JSON parse failed after extraction.");
      return [];
    }
  }
}

function extractJsonArray(text: string): string | null {
  const start = text.indexOf("[");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"' && !escape) {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function num(v: unknown, def = 0): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : def;
}

function strArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function normalizeParsedRow(
  row: unknown,
  nameMap: Record<string, string>,
  validIds: Set<string>
): ScreeningResult | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const rawId = o.candidateId ?? o.id;
  if (typeof rawId !== "string" || !validIds.has(rawId)) return null;

  const cid = rawId.trim();
  const clampScore = (x: number) => Math.round(Math.min(100, Math.max(0, x)));

  return {
    candidateId: cid,
    candidateName: nameMap[cid] ?? "Unknown",
    rank: Math.max(0, Math.floor(num(o.rank))),
    score: clampScore(num(o.score)),
    skillScore: clampScore(num(o.skillScore)),
    experienceScore: clampScore(num(o.experienceScore)),
    educationScore: clampScore(num(o.educationScore)),
    relevanceScore: clampScore(num(o.relevanceScore)),
    strengths: strArr(o.strengths),
    gaps: strArr(o.gaps),
    recommendation: coerceRecommendation(o.recommendation),
    confidence: Math.min(1, Math.max(0, num(o.confidence, 0.5))),
    explanation: typeof o.explanation === "string" ? o.explanation : "",
  };
}

function dedupeByCandidateId(rows: ScreeningResult[]): ScreeningResult[] {
  const best = new Map<string, ScreeningResult>();
  for (const r of rows) {
    const prev = best.get(r.candidateId);
    if (!prev || r.score > prev.score) best.set(r.candidateId, r);
  }
  return [...best.values()];
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
