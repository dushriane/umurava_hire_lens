import * as fs from "fs";
import * as path from "path";
import { connectDB } from "../src/config/db";
import { Job } from "../src/modules/job/job.model";
import { Applicant } from "../src/modules/applicant/applicant.model";
import mongoose from "mongoose";

async function seed() {
  await connectDB();

  const jobPath = path.join(process.cwd(), "fixtures", "manual-job.json");
  const candidatesPath = path.join(process.cwd(), "fixtures", "manual-candidates.json");

  if (!fs.existsSync(jobPath) || !fs.existsSync(candidatesPath)) {
    console.error("fixtures/manual-job.json or manual-candidates.json not found in repo root fixtures/");
    process.exit(1);
  }

  const jobData = JSON.parse(fs.readFileSync(jobPath, "utf-8"));
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf-8"));

  // Upsert job (by title)
  const job = await Job.findOneAndUpdate(
    { title: jobData.title },
    { title: jobData.title, requiredSkills: jobData.requiredSkills, experienceLevel: jobData.experienceLevel ?? "" },
    { upsert: true, new: true }
  );

  console.log(`Upserted job: ${job.title} (${job._id})`);

  // Insert applicants
  const created: any[] = [];
  for (const c of candidates) {
    const names = (c.name || "").split(" ");
    const firstName = names.shift() || "Unknown";
    const lastName = names.join(" ") || "";

    const applicant = new Applicant({
      jobId: job._id,
      firstName,
      lastName,
      email: c.email || `${c._id}@example.com`,
      skills: (c.skills || []).map((s: string) => ({ name: s, level: "Intermediate", yearsOfExperience: 0 })),
      status: "pending",
    } as any);
    await applicant.save();
    created.push(applicant);
  }

  console.log(`Inserted ${created.length} applicants.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
