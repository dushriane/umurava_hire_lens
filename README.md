# 🚀 Umurava HireLens AI

**Transparent AI-powered candidate screening for smarter hiring decisions**

---

## � Project Structure

```
umurava_hire_lens/
├── backend/              # Node.js + Express backend (main application)
│   ├── src/             # TypeScript source code
│   ├── tools/           # CLI utilities for testing
│   ├── scripts/         # Backend setup scripts (seed, etc.)
│   ├── tests/           # Integration and unit tests
│   ├── dist/            # Compiled output (build)
│   └── package.json     # Backend dependencies
├── docs/                # Project documentation
├── fixtures/            # Test data (JSON fixtures)
├── scripts/             # Repo-level helper scripts
└── archive/             # Backup of removed artifacts
```

## 🏗️ Architecture

- **Backend**: Express.js + TypeScript + MongoDB + Mongoose + Gemini AI
- **Auth**: JWT-based authentication with mock login
- **Modules**: Feature-based organization (auth, job, applicant, screening)
- **Testing**: Mocked Gemini model for deterministic, network-free tests
- **Configuration**: Centralized env-based config loader

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key

### Installation

```bash
# Install dependencies (root + backend)
npm run install:all

# Or manually:
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `backend/.env` and set:

```bash
MONGODB_URI=mongodb://localhost:27017/hire_lens
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
JWT_SECRET=your_jwt_secret
API_KEY=optional_api_key
PORT=3000
NODE_ENV=development
```

### Running the Server

From the repo root:

```bash
# Development (auto-reload)
npm run dev:watch

# Or just development
npm run dev

# Production build & start
npm run build
npm start

# Seed test data
npm run seed

# Run tests
npm test
npm run test:smoke
npm run test:integration
```

### CLI Tools

```bash
# Screen candidates from fixtures
npm run screen
npm run screen:demo
npm run screen:manual

# Check available Gemini models
npm run check-models
```

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with credentials |
| GET | `/api/v1/profile` | Get user profile (JWT required) |
| GET | `/api/v1/jobs` | List jobs |
| POST | `/api/v1/jobs` | Create job |
| GET | `/api/v1/applicants` | List applicants |
| POST | `/api/v1/applicants` | Create applicant |
| POST | `/api/v1/screening` | Screen candidates |
| GET | `/api/v1/screening/:jobId` | Get screening results |

### Authentication

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"recruiter","password":"password123"}'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "recruiter",
    "name": "Demo Recruiter",
    "role": "recruiter"
  }
}
```

**Use token in subsequent requests:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/profile
```

### Job Management

**Create a job:**
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{
    "title": "Senior Backend Engineer",
    "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
    "minExperienceYears": 5,
    "shortlistSize": 10,
    "educationLevel": "Bachelor"
  }'
```

**List jobs:**
```bash
curl http://localhost:3000/api/v1/jobs
```

### Applicant Management

**Create applicant:**
```bash
curl -X POST http://localhost:3000/api/v1/applicants \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "<job_id>",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "skills": [
      { "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 },
      { "name": "TypeScript", "level": "Advanced", "yearsOfExperience": 4 }
    ],
    "experience": [
      {
        "company": "TechCorp",
        "position": "Backend Engineer",
        "startDate": "2020-01-15",
        "endDate": "2024-01-15"
      }
    ],
    "education": [
      {
        "institution": "MIT",
        "degree": "BS Computer Science",
        "year": 2019
      }
    ]
  }'
```

**List applicants for a job:**
```bash
curl http://localhost:3000/api/v1/applicants?jobId=<job_id>
```

### Screening

**Trigger screening (requires API key):**
```bash
curl -X POST http://localhost:3000/api/v1/screening \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"jobId": "<job_id>"}'

# Response:
{
  "_id": "result_123",
  "jobId": "<job_id>",
  "candidates": [
    {
      "applicantId": "<applicant_id>",
      "score": 92,
      "rank": 1,
      "strengths": ["Strong Node.js expertise", "Excellent TypeScript skills"],
      "gaps": ["Limited MongoDB experience"],
      "recommendation": "Interview",
      "confidence": 95
    }
  ]
}
```

**Get screening results:**
```bash
curl http://localhost:3000/api/v1/screening/<job_id>
```

---

## 🔒 Security Best Practices

### Environment Variables
- **NEVER commit `.env`** — Only commit `.env.example`
- Use strong JWT secrets (min 32 characters)
- Rotate API keys regularly
- Use unique `GEMINI_API_KEY` per environment (dev/staging/prod)

### Authentication & Authorization
- JWT tokens expire after 8 hours by default
- All protected endpoints require valid JWT or API key
- Passwords stored as plaintext in mock data (demo only — use bcrypt in production)
- Update `backend/src/modules/auth/auth.controller.ts` to use bcrypt before production

### Data Protection
- MongoDB connection uses TLS in production (Atlas default)
- Applicant data is PII — implement data retention policies
- Screening results are kept in MongoDB — consider archival
- Add rate limiting to prevent abuse (coming in v2)

### API Security
- API key validation on costly endpoints (e.g., `/screening`)
- CORS enabled for localhost only in development
- Input validation on all endpoints (use Zod/Joi)
- Error messages don't leak sensitive info

### Deployment Checklist
- [ ] Use HTTPS only (not HTTP)
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB authentication
- [ ] Use strong API keys (no defaults)
- [ ] Set up log monitoring & alerting
- [ ] Implement rate limiting
- [ ] Enable API request signing (optional)
- [ ] Conduct security audit before launch

---

## 🧪 Testing

Tests are organized into:

- **Unit Tests** (`backend/tests/unit/`) - Module-level tests
- **Integration Tests** (`backend/tests/integration/`) - Smoke tests & end-to-end
- **Mocks** (`backend/tests/mocks/`) - Mock Gemini model factory

Run from root:

```bash
npm test              # All tests
npm run test:smoke    # Smoke test only
npm run test:integration  # Integration tests
```

### Running Tests in CI
Tests use mocked Gemini model, so they run **without API calls** or network access. Perfect for GitHub Actions / CI/CD pipelines.

```bash
# Run all tests (no Gemini API needed)
npm test
```

---

## �️ Development & Contributing

### Code Style
- TypeScript strict mode (enforced in backend)
- Use `npm run lint` to check code style
- Use `npm run format` to auto-format code
- Follow module structure: controller → service → model

### Adding a New Feature
1. Create a new folder under `backend/src/modules/<feature>/`
2. Add controller, service, model, and routes files
3. Import routes in `backend/src/app.ts`
4. Write tests in `backend/tests/unit/` or `backend/tests/integration/`
5. Update this README with new endpoints

### Pull Request Process
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm test`
3. Commit with clear messages: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create PR and request review

### Local Development Setup
```bash
# 1. Install dependencies
npm run install:all

# 2. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 3. Start MongoDB (if local)
mongod

# 4. Start development server
npm run dev:watch

# 5. Seed test data
npm run seed

# 6. Run tests in another terminal
npm test
```

---

## 📦 Tech Stack & Why We Chose It

### Backend: Express.js + TypeScript
- **Why**: Fast, lightweight, perfect for REST APIs
- **Alternative considered**: Fastify (faster, but Express is more mature)
- **TypeScript**: Catches bugs at compile time, better IDE support

### Database: MongoDB + Mongoose
- **Why**: Flexible schema for applicant data (highly variable fields)
- **Alternative considered**: PostgreSQL (more rigid, not ideal for recruiting)
- **Mongoose**: Type-safe queries with schema validation

### Auth: JWT (JSON Web Tokens)
- **Why**: Stateless authentication, scales across servers
- **Alternative considered**: Sessions (need Redis/store, harder to scale)
- **Implementation**: `jsonwebtoken` + custom middleware

### AI: Gemini API (Google)
- **Why**: Strong reasoning capabilities, structured output support, affordable
- **Alternative considered**: GPT-4 (expensive), Claude (rate limits)
- **Fallback**: Mock model for testing (deterministic, no API calls)

### Testing: Native TypeScript + Mocks
- **Why**: No external test framework needed for initial phase
- **Future**: Migrate to Jest or Vitest for larger test suite
- **Mocking**: Custom mock factories instead of 3rd-party libraries

### Build Tool: TypeScript Compiler (tsc)
- **Why**: Simple, no extra dependencies
- **Future**: Consider Turbo for monorepo builds when scaling

---

## 📚 Module Breakdown

### 🔐 Auth Module (`backend/src/modules/auth/`)
**Purpose**: Handle user authentication and JWT token generation
- **auth.controller.ts** — `POST /login` endpoint that validates credentials from `mock-users.json`
- **auth.service.ts** — JWT signing/verification logic (currently basic, upgrade with bcrypt before production)
- **auth.routes.ts** — Route definition for auth endpoints
- **user.model.ts** — Placeholder User schema (currently unused, for future DB-backed auth)
- **Key limitation**: Uses plaintext password matching in mock data (dev only)

### 💼 Job Module (`backend/src/modules/job/`)
**Purpose**: Manage job postings and requirements
- **job.controller.ts** — CRUD endpoints for jobs
- **job.service.ts** — Business logic (create, list, update jobs)
- **job.model.ts** — Mongoose schema with fields: title, requiredSkills, minExperienceYears, shortlistSize, educationLevel
- **job.routes.ts** — `GET /jobs`, `POST /jobs`, `GET /jobs/:id`
- **API key protection**: Optional (controlled by middleware)

### 👥 Applicant Module (`backend/src/modules/applicant/`)
**Purpose**: Store and manage candidate profiles
- **applicant.controller.ts** — Upload/list/get applicant endpoints
- **applicant.service.ts** — Business logic (create, parse resume, update status)
- **applicant.model.ts** — Mongoose schema with: firstName, lastName, email, skills[], experience[], education[], projects[], certifications[]
- **applicant.routes.ts** — `GET /applicants`, `POST /applicants`, `GET /applicants/:id`, multipart form support for resume uploads
- **Status tracking**: pending → screened → rejected/shortlisted

### 🤖 Screening Module (`backend/src/modules/screening/`)
**Purpose**: AI-powered candidate evaluation (core of the app)
- **ai.service.ts** — Orchestrates the screening workflow:
  1. Fetch job + applicants from DB
  2. Map to Gemini-compatible schema
  3. Call `screenCandidates()` with candidates
  4. Parse & store results
  5. Update applicant status to "screened"
- **screenCandidates.ts** — **Canonical AI pipeline**:
  - Batches candidates (25 per request for API limits)
  - Sends to Gemini with structured prompt
  - Parses JSON response
  - Dedupes and ranks results
  - **Supports dependency injection** for mock models in tests
- **screening.controller.ts** — `POST /screening` endpoint (triggers screening), `GET /screening/:jobId` (fetches results)
- **screening.routes.ts** — Route definitions with `requireApiKey` middleware
- **result.model.ts** — Mongoose schema storing screening results (scores, ranks, recommendations)
- **types.ts** — TypeScript interfaces: JobSchema, CandidateProfile, ScreeningResult
- **screeningSchema.ts** — Gemini structured output schema (JSON schema enforcer)
- **screeningInput.ts** — Validation helpers for API requests
- **Key feature**: Mocked in tests so no actual Gemini calls during development

---

## 🐛 Troubleshooting & Common Errors

### MongoDB Connection Errors
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB locally
```bash
# macOS / Linux
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

**Or use Atlas (cloud)**: Update `MONGODB_URI` in `.env`
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hire_lens?retryWrites=true
```

### JWT Token Expired
```
Error: jwt malformed / jwt expired
```
**Solution**: Login again to get a fresh token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"username":"recruiter","password":"password123"}'
```

### Gemini API Key Invalid
```
Error: [GoogleGenerativeAI Error]: 401 Unauthorized
```
**Solution**: Verify your API key
```bash
# In backend/.env
GEMINI_API_KEY=your_correct_key_here
```

**Check key works:**
```bash
npm run check-models  # Lists available models
```

### Port 3000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Use a different port
```bash
PORT=3001 npm run dev
```

### `Cannot find module '@google/generative-ai'`
**Solution**: Install dependencies
```bash
cd backend
npm install
```

### TypeScript Errors in Backend
```
Error: File 'backend/src/app.ts' is not under 'rootDir'
```
**Solution**: Delete root `tsconfig.json` (already deprecated)
```bash
rm tsconfig.json
```

### Tests Fail on First Run
**Likely cause**: MongoDB not seeded yet
```bash
npm run seed     # Populate test data
npm run test     # Run tests
```

### `npm run dev` Doesn't Auto-Reload
**Solution**: Use `dev:watch` instead
```bash
npm run dev:watch  # Uses ts-node-dev with auto-reload
```

---

## �📖 Additional Documentation

- [Architecture & Setup Details](docs/README.md) - In-depth architecture guide
- [Backend Modules](backend/src/modules/) - Module-specific logic
- [Environment Variables](backend/.env.example) - Required env vars

---

## 🎯 Problem Statement

Recruiters often struggle with:
* Time-consuming manual screening processes
* Difficulty comparing candidates across diverse formats

This system answers the question:
> *How can AI be used to accurately, transparently, and efficiently screen and shortlist candidates while preserving human-led decisions?*

---

## ✨ Key Features

### 🧾 Job Management
* Create and manage job postings
* Define required skills, experience, and criteria

### 👤 Applicant Ingestion
* Structured talent profile input
* Support for CSV / manual entry
* Resume upload support

### 🤖 AI-Powered Screening

* Multi-candidate evaluation using Gemini API
* Weighted scoring system (skills, experience, education, relevance)
* Automatic ranking of candidates

### 📊 Shortlist Generation

* Top 10 / Top 20 candidates
* Sorted by AI-generated scores

### 🔍 Explainable AI (Core Feature)

Each candidate includes:

* ✅ Strengths
* ⚠️ Gaps / Risks
* 🎯 Relevance to job
* 🧠 Final recommendation

### 📈 Recruiter Dashboard

* Clean and intuitive UI
* Easy navigation between candidates and results

---

## 🏗️ System Architecture

### 🔹 Frontend

* **Not started yet** — Coming in future phase
* Planned: React + TypeScript + Vite + Tailwind CSS

### 🔹 Backend

* Node.js (TypeScript)
* RESTful API architecture

### 🔹 Database

* MongoDB (MongoDB Atlas)

### 🔹 AI Layer

* Gemini API (mandatory)
* Prompt-based evaluation and ranking

---

## 🧠 AI Decision Flow

1. Recruiter creates a job
2. Applicants are uploaded (structured schema)
3. Backend aggregates job + candidate data
4. Data is sent to Gemini API in a structured prompt
5. AI evaluates candidates based on:

   * Skills match
   * Experience relevance
   * Education
   * Overall fit
6. AI returns:

   * Scores (0–100)
   * Rankings
   * Strengths & gaps
   * Final recommendations
7. Results are stored and displayed in the dashboard

---

## 🗄️ Database Schema Overview

### 📌 Jobs

* Title, description, required skills, experience level

### 📌 Applicants

* Basic info (name, email, location)
* Skills (with proficiency & experience)
* Work experience
* Education
* Projects
* Certifications
* Availability
* Social links

### 📌 Screening Results

* Candidate scores
* Rankings
* Strengths & gaps
* Recommendations
* Confidence scores (optional)

---

## 🔌 API Endpoints (Sample)

### Jobs

* `POST /jobs` → Create job
* `GET /jobs/:id` → Get job

### Applicants

* `POST /applicants` → Add candidate
* `GET /applicants/:jobId` → Get candidates

### Screening

* `POST /screen/:jobId` → Trigger AI screening
* `GET /results/:jobId` → Get shortlist

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/hirelens-ai.git
cd hirelens-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the backend

```bash
npm run dev
```

### 5. Run the frontend

```bash
npm run dev
```

---

## 🚀 Deployment

* Frontend: Vercel
* Backend: Render / Railway
* Database: MongoDB Atlas

Ensure:

* Environment variables are configured
* API endpoints are accessible
* No hardcoded secrets

---

## 🧪 AI Prompt Example (Simplified)

```text
Evaluate the following candidates for the given job.

Return:
- Score (0–100)
- Strengths
- Gaps
- Recommendation (Shortlist / Not shortlisted)

Rank all candidates and return the Top 10.
```

---

## ⚠️ Assumptions & Limitations

* AI decisions depend on **data quality**
* Bias may exist if input data is incomplete or skewed
* Not a replacement for human recruiters
* Resume parsing may be simplified for MVP

---

## 🔮 Future Improvements

* Advanced resume parsing (NLP)
* Bias detection & fairness scoring
* Interview recommendation system
* Real-time collaboration for recruiters
* Integration with job platforms

---

## 👥 Team

* Frontend Engineer
* Backend Engineer
* AI Engineer
* DB Designer

---

## 🏆 Hackathon Goal

Build a **production-ready prototype** that:

* Demonstrates strong AI reasoning
* Provides real recruiter value
* Can scale within Umurava’s ecosystem

---

## 📬 Contact

For questions or collaboration:

* Email: [competence@umurava.africa](mailto:competence@umurava.africa)

---

## ⭐ Final Note

> *This project is built with the vision of making hiring smarter, faster, and more transparent using responsible AI.*

---
