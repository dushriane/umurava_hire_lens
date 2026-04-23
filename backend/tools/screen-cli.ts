import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { screenCandidates } from "../src/modules/screening/screenCandidates";
import { testJob, testCandidates } from "../src/modules/screening/testData";
import { parseJobJson, parseCandidatesJson } from "../src/modules/screening/screeningInput";
import { CandidateProfile, ScreeningResult } from "../src/modules/screening/types";

dotenv.config();

function printHelp(): void {
  console.log(`
HireLens — AI candidate screening (Gemini)

Usage:
  npm run screen                         Demo run (CSV batch + test job from testData)
  npm run screen -- --demo               Same as default
  npm run screen -- --manual             fixtures/manual-job.json + fixtures/manual-candidates.json
  npm run screen -- --job <file> --candidates <file>
  npm run screen -- --one <file>         One candidate JSON (+ --job optional; default job: fixtures/manual-job.json)

Options:
  --out <file>     Write results JSON (default: results.json)

Environment:
  GEMINI_API_KEY   Required
  GEMINI_MODEL     Optional (default: gemini-2.0-flash)

Tip: copy fixtures/manual-*.json, edit profiles, then run with --job / --candidates paths.
`.trim());
}

function readJsonFile(filePath: string): unknown {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, "utf-8");
  return JSON.parse(raw) as unknown;
}

function parseArgs(argv: string[]) {
  const args = {
    demo: false,
    manual: false,
    job: null as string | null,
    candidates: null as string | null,
    one: null as string | null,
    out: "results.json",
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--demo") args.demo = true;
    else if (a === "--manual") args.manual = true;
    else if (a === "--job") args.job = argv[++i] ?? null;
    else if (a === "--candidates") args.candidates = argv[++i] ?? null;
    else if (a === "--one") args.one = argv[++i] ?? null;
    else if (a === "--out") args.out = argv[++i] ?? "results.json";
  }
  return args;
}

function printResults(results: ScreeningResult[], jobTitle: string, pool: number, shortlist: number, outPath: string): void {
  console.log("✅ SHORTLIST RESULTS\n");
  console.log("=".repeat(60));

  results.forEach((r) => {
    console.log(`\n#${r.rank} — ${r.candidateName}`);
    console.log(`   Score: ${r.score}/100 | Recommendation: ${r.recommendation}`);
    console.log(`   Strengths: ${(r.strengths ?? []).join(" · ")}`);
    console.log(`   Gaps:      ${(r.gaps ?? []).join(" · ")}`);
    console.log(`   → ${r.explanation}`);
  });

  console.log(`\n📁 Job: ${jobTitle} | Pool size: ${pool} | Shortlist cap: ${shortlist}`);
  console.log(`📁 Results written to: ${outPath}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  let job = testJob;
  let candidates: CandidateProfile[] = testCandidates as CandidateProfile[];

  if (args.manual) {
    job = parseJobJson(readJsonFile(path.join("fixtures", "manual-job.json")));
    candidates = parseCandidatesJson(readJsonFile(path.join("fixtures", "manual-candidates.json")));
  } else if (args.job && args.candidates) {
    job = parseJobJson(readJsonFile(args.job));
    candidates = parseCandidatesJson(readJsonFile(args.candidates));
  } else if (args.one) {
    const jobPath = args.job ?? path.join("fixtures", "manual-job.json");
    job = parseJobJson(readJsonFile(jobPath));
    const one = readJsonFile(args.one);
    candidates = parseCandidatesJson(Array.isArray(one) ? one : [one]);
  } else if (!args.demo && (args.job || args.candidates)) {
    throw new Error("Provide both --job and --candidates, or use --manual / --demo / --one.");
  }

  console.log("🚀 HireLens AI — screening\n");
  console.log(`📋 Job: ${job.title}`);
  console.log(`👥 Candidates: ${candidates.length}`);
  console.log(`🎯 Shortlist size: ${job.shortlistSize}`);
  console.log(`🤖 Model: ${process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash (default)"}\n`);
  console.log("Calling Gemini...\n");

  const results = await screenCandidates(job, candidates);

  if (results.length === 0 && candidates.length > 0) {
    console.error(
      "\n⚠️  No scored candidates returned. Check GEMINI_API_KEY, try GEMINI_MODEL=gemini-1.5-flash-latest, and run: npm run check-models\n"
    );
    process.exitCode = 1;
  }

  const outPath = path.isAbsolute(args.out) ? args.out : path.resolve(process.cwd(), args.out);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  printResults(results, job.title, candidates.length, job.shortlistSize, outPath);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
