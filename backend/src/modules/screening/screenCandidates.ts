import { GoogleGenerativeAI } from "@google/generative-ai";
import { JobSchema, CandidateProfile, ScreeningResult } from "./types";
import { assertApiKey } from "./screeningInput";
import { screeningResultsResponseSchema } from "./screeningSchema";
import config from "../../config";
import logger from "../../utils/logger";

let cachedClient: GoogleGenerativeAI | null = null;
let cachedModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;
let cachedModelName: string | null = null;

/**
 * Get Gemini model name from config or default
 */
function getModelName(): string {
  return config.gemini.model || "gemini-2.0-flash";
}

/**
 * Get or create cached Gemini model with screening configuration
 */
function getScreeningModel() {
  assertApiKey();
  const modelName = getModelName();
  
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(config.gemini.apiKey!);
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

/**
 * Split array into chunks of specified size
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Parse JSON response, handling markdown fence wrapping
 */
function safeParseJSON(text: string): any[] {
  try {
    return JSON.parse(text);
  } catch (e) {
    // try to strip markdown fences
    const cleaned = text.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Remove duplicate results by candidateId, keeping first occurrence
 */
function dedupeByCandidateId(rows: ScreeningResult[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.candidateId as string)) return false;
    seen.add(r.candidateId as string);
    return true;
  });
}

/**
 * Normalize Gemini API response row to ScreeningResult interface
 * Handles field name variations and type coercion
 */
function normalizeParsedRow(
  row: any,
  nameMap: Record<string, string>,
  emailMap: Record<string, string>,
  validIds: Set<string>,
  jobId: string
): ScreeningResult | null {
  if (!row || typeof row !== "object") return null;
  
  const id = String(row.candidateId ?? row.candidate_id ?? row.id);
  if (!id || !validIds.has(id)) return null;
  
  return {
    jobId,
    candidateId: id,
    candidateName: nameMap[id] ?? row.candidateName ?? "Unknown",
    candidateEmail: emailMap[id] ?? row.candidateEmail ?? "unknown@example.com",
    rank: Number(row.rank || 0),
    score: Number(row.score || 0),
    skillScore: Number(row.skillScore || 0),
    experienceScore: Number(row.experienceScore || 0),
    educationScore: Number(row.educationScore || 0),
    relevanceScore: Number(row.relevanceScore || 0),
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    gaps: Array.isArray(row.gaps) ? row.gaps : [],
    recommendation: String(row.recommendation || "Consider") as "Hire" | "Interview" | "Consider" | "Reject",
    confidence: Number(row.confidence || 0.5),
    explanation: String(row.explanation || ""),
    createdAt: new Date(),
  };
}

/**
 * Sanitize candidate for Gemini prompt (remove PII, keep only screening-relevant fields)
 */
function sanitise(c: CandidateProfile) {
  return {
    candidateId: String(c._id),
    skills: c.skills,
    experienceYears: c.experienceYears,
    education: c.education,
    projects: c.projects ?? [],
    certifications: c.certifications ?? [],
  };
}

/**
 * Build screening prompt for Gemini API
 */
function buildPrompt(job: JobSchema, candidates: object[]) {
  return `
You are an expert, unbiased technical recruiter AI.
Evaluate candidates ONLY on skills, experience, and qualifications.
IGNORE all demographic signals: name, nationality, age, gender.
Return ONLY valid JSON — no markdown, no preamble.

JOB REQUIREMENTS:
${JSON.stringify(job, null, 2)}

CANDIDATES:
${JSON.stringify(candidates, null, 2)}

For each candidate, provide:
- candidateId: must match the input candidateId exactly
- rank, score, skillScore, experienceScore, educationScore, relevanceScore (0-100)
- strengths, gaps (arrays of strings)
- recommendation: "Hire", "Interview", "Consider", or "Reject"
- confidence: 0-1
- explanation: brief summary of assessment
`;
}

/**
 * Screen candidates against a job using Gemini API
 * Processes candidates in batches, deduplicates results, and sorts by score
 * @param job Job requirements
 * @param candidates Applicants to screen
 * @param overrides Test override for injecting mock model
 * @returns Sorted screening results, limited to job's shortlistSize
 */
export async function screenCandidates(
  job: JobSchema,
  candidates: CandidateProfile[],
  overrides?: { getModel?: () => any }
): Promise<ScreeningResult[]> {
  if (candidates.length === 0) {
    logger.info("No candidates to screen", { jobId: job._id });
    return [];
  }

  logger.info("Starting candidate screening", {
    jobId: job._id,
    jobTitle: job.title,
    candidateCount: candidates.length,
  });

  const nameMap: Record<string, string> = {};
  const emailMap: Record<string, string> = {};
  
  candidates.forEach((c) => {
    const id = String(c._id);
    nameMap[id] = c.name;
    emailMap[id] = c.email;
  });

  const batches = chunkArray(candidates, 25);
  let allResults: ScreeningResult[] = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const validIds = new Set(batch.map((c) => String(c._id)));
    const sanitised = batch.map(sanitise);
    const prompt = buildPrompt(job, sanitised);
    const model = overrides?.getModel ? overrides.getModel() : getScreeningModel();

    try {
      logger.debug("Processing batch", {
        jobId: job._id,
        batchIndex,
        batchSize: batch.length,
        totalBatches: batches.length,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      
      const text = result.response.text();
      const parsed = safeParseJSON(text);
      const normalized = parsed
        .map((row) => normalizeParsedRow(row, nameMap, emailMap, validIds, String(job._id)))
        .filter((r): r is ScreeningResult => r !== null);
      const deduped = dedupeByCandidateId(normalized);
      
      logger.debug("Batch processed", {
        jobId: job._id,
        batchIndex,
        resultsCount: deduped.length,
      });

      allResults = [...allResults, ...deduped];
    } catch (err) {
      logger.error("Gemini batch failed", {
        jobId: job._id,
        batchIndex,
        model: getModelName(),
        error: err,
      });
    }
  }

  const sorted = allResults
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      candidateName: nameMap[r.candidateId as string] ?? r.candidateName ?? "Unknown",
      candidateEmail: emailMap[r.candidateId as string] ?? r.candidateEmail ?? "unknown@example.com",
    }))
    .slice(0, job.shortlistSize ?? 10);

  logger.info("Screening completed", {
    jobId: job._id,
    candidatesProcessed: candidates.length,
    resultsReturned: sorted.length,
  });

  return sorted;
}