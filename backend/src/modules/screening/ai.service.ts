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

    // Helpers to compute experienceYears and extract info from parsedText
    const parseYearsFromText = (text: string | undefined): number | null => {
      if (!text) return null;
      const m = text.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*years?/i);
      if (m) return Number(m[1]);
      return null;
    };

    const parseYearRangesFromText = (text: string | undefined): number => {
      if (!text) return 0;
      const rangeRegex = /(20\d{2}|19\d{2})\s*[–-]\s*(20\d{2}|19\d{2})/g;
      let total = 0;
      let match: RegExpExecArray | null;
      while ((match = rangeRegex.exec(text)) !== null) {
        try {
          const start = Number(match[1]);
          const end = Number(match[2]);
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            total += end - start + 1;
          }
        } catch (e) {
          // ignore
        }
      }
      return total;
    };

    const yearsFromExperienceArray = (expArray: any[]): number => {
      if (!Array.isArray(expArray)) return 0;
      let totalMonths = 0;
      for (const item of expArray) {
        const start = item?.startDate ? new Date(item.startDate) : null;
        const end = item?.endDate ? new Date(item.endDate) : null;
        if (start && !isNaN(start.getTime())) {
          const effectiveEnd = end && !isNaN(end.getTime()) ? end : new Date();
          const months = (effectiveEnd.getFullYear() - start.getFullYear()) * 12 + (effectiveEnd.getMonth() - start.getMonth());
          if (!isNaN(months) && months > 0) totalMonths += months;
        }
      }
      return Math.round((totalMonths / 12) * 10) / 10; // one decimal
    };

    const extractNameFromParsed = (text: string | undefined): string | null => {
      if (!text) return null;
      // Try common patterns: "Name: John Doe" or first line
      const nameLabel = text.match(/name[:\-]\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
      if (nameLabel) return nameLabel[1].trim();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(lines[0])) return lines[0];
      return null;
    };

    // Map applicants to CandidateProfile expected shape
    const candidates = applicants.map((a: any) => {
      const parsedText: string | undefined = a.parsedText || a.rawProfile?.parsedText;

      // Name: prefer explicit fields, then parsed resume text, then rawProfile
      let name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
      if (!name) {
        name = extractNameFromParsed(parsedText) || a.rawProfile?.name || "Unknown";
      }

      const skills = Array.isArray(a.skills) ? a.skills.map((s: any) => (s && s.name) || String(s)) : [];

      // experienceYears priority:
      // 1) explicit numeric field, 2) compute from experience array dates, 3) parse from parsedText, 4) parse year ranges in text, 5) fallback to number of experience items
      let experienceYears: number = 0;
      if (typeof a.experienceYears === "number" && !isNaN(a.experienceYears)) {
        experienceYears = a.experienceYears;
      } else if (Array.isArray(a.experience) && a.experience.length > 0) {
        const years = yearsFromExperienceArray(a.experience);
        experienceYears = years > 0 ? years : a.experience.length;
      } else {
        const parsedYears = parseYearsFromText(parsedText);
        if (parsedYears) experienceYears = parsedYears;
        else {
          const ranges = parseYearRangesFromText(parsedText);
          experienceYears = ranges > 0 ? ranges : (a.experience ? a.experience.length : 0);
        }
      }

      const education = Array.isArray(a.education) && a.education.length > 0 ? (a.education[0].degree ?? String(a.education[0].institution ?? "")) : (a.education || "Unknown");

      return {
        _id: String(a._id),
        name,
        skills,
        experienceYears,
        education,
        projects: a.projects ?? [],
        certifications: a.certifications ?? [],
        parsedText,
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