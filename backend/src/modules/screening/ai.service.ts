import { screenCandidates } from "./screenCandidates";
import { Job } from "../job/job.model";
import { Applicant } from "../applicant/applicant.model";
import { Result } from "./result.model";

export class AIService {
  /**
   * Run the canonical screening pipeline (delegates to screenCandidates)
   */
  public static async runScreening(jobId: string) {
    // 1. Fetch Job
    const job = await Job.findById(jobId).lean();
    if (!job) {
      throw new Error("Job not found");
    }

    // 2. Fetch Applicants (pending)
    const applicants = await Applicant.find({ jobId, status: "pending" }).lean();
    if (!applicants || applicants.length === 0) {
      throw new Error("No pending applicants found for this job");
    }

    // Map to JobSchema expected by screenCandidates
    const jobSchema = {
      _id: String(job._id),
      title: (job as any).title || "",
      requiredSkills: (job as any).requiredSkills || [],
      minExperienceYears: (job as any).minExperienceYears ?? 0,
      shortlistSize: (job as any).shortlistSize ?? 10,
      niceToHave: (job as any).niceToHave,
      educationLevel: (job as any).educationLevel,
    };

    // Map applicants to CandidateProfile expected shape
    const candidates = applicants.map((a: any) => {
      const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || (a.rawProfile?.name ?? "Unknown");
      const skills = Array.isArray(a.skills) ? a.skills.map((s: any) => (s && s.name) || String(s)) : [];
      const experienceYears = typeof a.experienceYears === "number" ? a.experienceYears : (a.experience ? a.experience.length : 0);
      const education = Array.isArray(a.education) && a.education.length > 0 ? (a.education[0].degree ?? String(a.education[0].institution ?? "")) : (a.education || "Unknown");

      return {
        _id: String(a._id),
        name,
        skills,
        experienceYears,
        education,
        projects: a.projects ?? [],
        certifications: a.certifications ?? [],
      };
    });

    // 3. Call canonical pipeline
    const results = await screenCandidates(jobSchema as any, candidates as any);

    // 4. Store into Result model
    const candidateResults = results.map((r: any) => ({
      applicantId: r.candidateId,
      score: r.score,
      rank: r.rank,
      strengths: r.strengths || [],
      gaps: r.gaps || [],
      recommendation: r.recommendation,
      confidence: r.confidence || 80,
    }));

    const savedResult = await Result.findOneAndUpdate(
      { jobId },
      { jobId, candidates: candidateResults },
      { new: true, upsert: true }
    );

    // 5. mark applicants screened
    await Applicant.updateMany({ jobId, status: "pending" }, { $set: { status: "screened" } });

    return savedResult;
  }

  public static async getResultsByJob(jobId: string) {
    return await Result.findOne({ jobId }).populate("candidates.applicantId", "firstName lastName email");
  }
}