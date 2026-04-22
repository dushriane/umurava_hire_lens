import {
  Job, UmuravaProfile, ExternalApplicant,
  ScreeningResult, ScreeningSettings
} from '@/types'

// ------------------------------------------------------------
// MOCK JOBS
// ------------------------------------------------------------

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-001',
    title: 'Senior ML Engineer',
    department: 'Data & AI',
    type: 'Full-time',
    location: 'Kigali, Rwanda',
    experienceLevel: 'Senior (5+ years)',
    salaryRange: '600,000 – 900,000 RWF/month',
    description: 'We are looking for a Senior ML Engineer to lead our AI initiative at Umurava. You will design, build, and deploy machine learning models that power our talent matching platform.',
    requiredSkills: ['Python', 'TensorFlow', 'MLOps', 'Docker', 'AWS'],
    educationRequirements: "Bachelor's or Master's in Computer Science, Data Science, or related field",
    idealCandidateProfile: 'Someone who has shipped production ML systems, understands MLOps pipelines, and can mentor junior engineers. Bonus: experience with NLP or recommendation systems.',
    status: 'active',
    applicantCount: 42,
    postedDate: '2026-04-10',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'job-002',
    title: 'Frontend Developer (React/Next.js)',
    department: 'Engineering',
    type: 'Contract',
    location: 'Remote – Africa',
    experienceLevel: 'Mid-level (2–5 years)',
    salaryRange: '400,000 – 600,000 RWF/month',
    description: 'Build recruiter-facing interfaces and candidate-facing dashboards for the Umurava platform. You will work closely with the design and product team.',
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
    educationRequirements: "Bachelor's in Computer Science or equivalent experience",
    idealCandidateProfile: 'Strong eye for UI/UX, writes clean TypeScript, understands state management deeply.',
    status: 'active',
    applicantCount: 87,
    postedDate: '2026-04-08',
    createdAt: '2026-04-08T09:00:00Z',
    updatedAt: '2026-04-08T09:00:00Z',
  },
  {
    id: 'job-003',
    title: 'Data Science Analyst',
    department: 'Data & AI',
    type: 'Full-time',
    location: 'Lagos, Nigeria',
    experienceLevel: 'Mid-level (2–5 years)',
    salaryRange: '350,000 – 500,000 RWF/month',
    description: 'Analyze talent data and build dashboards that help Umurava improve matching accuracy and business decisions.',
    requiredSkills: ['SQL', 'Python', 'Power BI', 'Pandas', 'Statistics'],
    educationRequirements: "Bachelor's in Statistics, Mathematics, or Data Science",
    idealCandidateProfile: 'Data-driven thinker who can translate numbers into business insights.',
    status: 'screening',
    applicantCount: 31,
    postedDate: '2026-04-05',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
  },
]

// ------------------------------------------------------------
// MOCK UMURAVA PROFILES (Scenario 1)
// ------------------------------------------------------------

export const MOCK_UMURAVA_PROFILES: UmuravaProfile[] = [
  {
    id: 'app-001', userId: 'u-001',
    fullName: 'Amina Uwimana', email: 'amina@email.com',
    location: 'Kigali, Rwanda', yearsOfExperience: 5,
    currentRole: 'ML Engineer at Rwanda Tech Hub',
    skills: ['Python', 'TensorFlow', 'Keras', 'MLOps', 'Docker', 'FastAPI'],
    education: [{ degree: "Master's", field: 'Data Science', institution: 'UR', graduationYear: 2021 }],
    workHistory: [
      { title: 'ML Engineer', company: 'Rwanda Tech Hub', startDate: '2021-06', description: 'Built and deployed NLP models for document classification.' },
      { title: 'Data Analyst', company: 'BK Tech', startDate: '2019-09', endDate: '2021-05', description: 'Data pipelines and BI dashboards.' },
    ],
    certifications: ['TensorFlow Developer Certificate', 'AWS ML Specialty'],
    githubUrl: 'https://github.com/amina-uw',
    profileCompleteness: 100,
    source: 'umurava',
  },
  {
    id: 'app-002', userId: 'u-002',
    fullName: 'Kwame Asante', email: 'kwame@email.com',
    location: 'Accra, Ghana', yearsOfExperience: 4,
    currentRole: 'ML Engineer',
    skills: ['PyTorch', 'MLOps', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
    education: [{ degree: "Bachelor's", field: 'Computer Science', institution: 'KNUST', graduationYear: 2020 }],
    workHistory: [
      { title: 'ML Engineer', company: 'Accra AI Labs', startDate: '2020-07', description: 'Computer vision models for medical imaging.' },
    ],
    certifications: ['PyTorch Certification', 'GCP Professional Data Engineer'],
    githubUrl: 'https://github.com/kwame-ai',
    profileCompleteness: 100,
    source: 'umurava',
  },
  {
    id: 'app-003', userId: 'u-003',
    fullName: 'Fatima Diallo', email: 'fatima@email.com',
    location: 'Dakar, Senegal', yearsOfExperience: 3,
    currentRole: 'Junior ML Engineer',
    skills: ['Python', 'Scikit-learn', 'FastAPI', 'SQL', 'Pandas'],
    education: [{ degree: "Bachelor's", field: 'Mathematics', institution: 'UCAD', graduationYear: 2022 }],
    workHistory: [
      { title: 'Junior ML Engineer', company: 'Dakar Fintech', startDate: '2022-09', description: 'Credit scoring models using classical ML.' },
    ],
    certifications: ['DeepLearning.AI ML Specialization'],
    profileCompleteness: 80,
    source: 'umurava',
  },
  {
    id: 'app-004', userId: 'u-004',
    fullName: 'David Mwangi', email: 'david@email.com',
    location: 'Nairobi, Kenya', yearsOfExperience: 2,
    skills: ['Python', 'SQL', 'Tableau', 'Scikit-learn'],
    education: [{ degree: "Bachelor's", field: 'Information Technology', institution: 'UoN', graduationYear: 2023 }],
    workHistory: [
      { title: 'Data Analyst', company: 'Safaricom', startDate: '2023-03', description: 'Business intelligence dashboards.' },
    ],
    certifications: [],
    profileCompleteness: 65,
    source: 'umurava',
  },
  {
    id: 'app-005', userId: 'u-005',
    fullName: 'Grace Njeri', email: 'grace@email.com',
    location: 'Nairobi, Kenya', yearsOfExperience: 6,
    currentRole: 'Senior Data Scientist',
    skills: ['TensorFlow', 'GCP', 'Vertex AI', 'Python', 'BigQuery', 'MLOps'],
    education: [{ degree: "Master's", field: 'Computer Science', institution: 'Strathmore', graduationYear: 2019 }],
    workHistory: [
      { title: 'Senior Data Scientist', company: 'Google Africa', startDate: '2019-08', description: 'Large-scale ML pipelines on GCP Vertex AI.' },
    ],
    certifications: ['GCP Professional ML Engineer', 'TensorFlow Developer'],
    profileCompleteness: 100,
    source: 'umurava',
  },
]

// ------------------------------------------------------------
// MOCK SCREENING RESULT (what Gemini AI returns)
// ------------------------------------------------------------

export const MOCK_SCREENING_RESULT: ScreeningResult = {
  id: 'screen-001',
  jobId: 'job-001',
  jobTitle: 'Senior ML Engineer',
  totalScreened: 42,
  shortlistSize: 10,
  averageScore: 81,
  topScore: 94,
  screenedAt: '2026-04-20T14:30:00Z',
  settings: {
    jobId: 'job-001',
    applicantIds: ['app-001', 'app-002', 'app-003', 'app-004', 'app-005'],
    shortlistSize: 10,
    weights: { skills: 40, experience: 35, education: 15, relevance: 10 },
  },
  shortlist: [
    {
      rank: 1, applicantId: 'app-001',
      applicantName: 'Amina Uwimana', applicantLocation: 'Kigali, Rwanda',
      applicantSource: 'umurava', yearsOfExperience: 5, matchScore: 94,
      reasoning: 'Strong Python & TensorFlow background directly aligned with role requirements. Production MLOps experience is a major differentiator. Local candidate reduces onboarding overhead significantly.',
      strengths: ['TensorFlow', 'MLOps', '5yr exp', 'Kigali-based', 'AWS certified'],
      gaps: ['No Kubernetes experience listed'],
      recommendation: 'Highly recommended — interview immediately',
    },
    {
      rank: 2, applicantId: 'app-002',
      applicantName: 'Kwame Asante', applicantLocation: 'Accra, Ghana',
      applicantSource: 'umurava', yearsOfExperience: 4, matchScore: 89,
      reasoning: 'Excellent PyTorch proficiency and Docker/Kubernetes deployment experience shows strong production readiness. Slightly less TensorFlow exposure but CI/CD track record is impressive.',
      strengths: ['PyTorch', 'Docker', 'Kubernetes', 'CI/CD'],
      gaps: ['TensorFlow not primary framework'],
      recommendation: 'Strong candidate — recommend first-round interview',
    },
    {
      rank: 3, applicantId: 'app-005',
      applicantName: 'Grace Njeri', applicantLocation: 'Nairobi, Kenya',
      applicantSource: 'umurava', yearsOfExperience: 6, matchScore: 86,
      reasoning: 'Most experienced candidate. GCP Vertex AI expertise is exceptional. However, the role is AWS-focused and her stack is GCP-centric, which introduces some ramp-up risk.',
      strengths: ['6yr exp', 'Vertex AI', 'TensorFlow', 'MLOps', 'BigQuery'],
      gaps: ['AWS vs GCP gap', 'Overqualified risk'],
      recommendation: 'Very strong — discuss AWS transition expectations',
    },
    {
      rank: 4, applicantId: 'app-003',
      applicantName: 'Fatima Diallo', applicantLocation: 'Dakar, Senegal',
      applicantSource: 'umurava', yearsOfExperience: 3, matchScore: 78,
      reasoning: 'FastAPI + Scikit-learn shows practical ML deployment experience. Less seniority but high portfolio quality compensates. Growth potential is notable for a junior-to-mid transition.',
      strengths: ['FastAPI', 'Scikit-learn', 'Strong portfolio'],
      gaps: ['Only 3yr exp', 'No MLOps tools listed', 'No cloud certifications'],
      recommendation: 'Good candidate — consider if senior pipeline is thin',
    },
    {
      rank: 5, applicantId: 'app-004',
      applicantName: 'David Mwangi', applicantLocation: 'Nairobi, Kenya',
      applicantSource: 'umurava', yearsOfExperience: 2, matchScore: 61,
      reasoning: 'Solid fundamentals but primarily a data analyst profile rather than ML engineer. SQL and Tableau skills are business-facing rather than engineering-facing for this role.',
      strengths: ['Python basics', 'SQL'],
      gaps: ['Only 2yr exp', 'No deep learning', 'No MLOps', 'No cloud experience'],
      recommendation: 'Not recommended for this role — better fit for analyst position',
    },
  ],
}