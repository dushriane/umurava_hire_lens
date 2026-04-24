# HireLens Documentation

## Project Overview

HireLens is a candidate screening platform using AI (Gemini) to evaluate applicants against job requirements.

## Architecture

### Folder Structure

```
backend/
├── src/
│   ├── app.ts                 # Express server bootstrap
│   ├── config/                # Configuration loader
│   ├── modules/               # Feature-based modules (auth, job, applicant, screening)
│   ├── middleware/            # Express middleware
│   ├── utils/                 # Utility helpers (logger, formatter, parser)
│   ├── scripts/               # Backend-only scripts (seed)
│   └── tests/                 # Test files (unit, integration, mocks)
├── tools/                     # CLI wrappers
├── scripts/                   # Setup and deployment scripts
└── dist/                      # Compiled output
```

### Core Modules

1. **auth** - JWT-based authentication and login
2. **job** - Job postings and requirements
3. **applicant** - Candidate applications and profiles
4. **screening** - AI-powered candidate screening and evaluation

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Gemini API key

### Installation

```bash
# From backend folder
cd backend
npm install
```

### Environment Variables

Create `.env` file in `backend/` with:

```
MONGODB_URI=mongodb://localhost:27017/hire_lens
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
PORT=3000
NODE_ENV=development
```

### Running

```bash
# Development (with auto-reload)
npm run dev:watch

# Production build
npm run build
npm start

# Seed database with test data
npm run seed

# Run tests
npm test
npm run test:smoke
npm run test:integration
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with username/password
- `GET /api/v1/profile` - Get authenticated user profile (requires JWT)

### Jobs
- `GET /api/v1/jobs` - List all jobs
- `POST /api/v1/jobs` - Create a job
- `GET /api/v1/jobs/:id` - Get job details

### Applicants
- `GET /api/v1/applicants` - List applicants
- `POST /api/v1/applicants` - Create applicant
- `GET /api/v1/applicants/:id` - Get applicant details

### Screening
- `POST /api/v1/screening` - Screen candidates for a job
- `GET /api/v1/screening/:jobId` - Get screening results

## Testing

Tests are organized into:

- **Unit Tests** (`tests/unit/`) - Module-level tests
- **Integration Tests** (`tests/integration/`) - End-to-end smoke tests
- **Mocks** (`tests/mocks/`) - Mock data and factories

Run tests with:

```bash
npm test              # Run all tests
npm run test:smoke    # Smoke tests only
npm run test:integration  # Integration tests only
```

## Development Workflow

1. **Code changes** → TypeScript (`src/`)
2. **Build** → Compile to JavaScript (`dist/`)
3. **Run** → `npm run dev` or `npm start`
4. **Test** → `npm test`
5. **Deploy** → Push to production

## Configuration

Central configuration is in `src/config/index.ts` and loads environment variables.

Key settings:
- MongoDB URI
- Gemini API credentials
- JWT secret
- Server port

## Logging

Simple logger available at `src/utils/logger.ts`. Can be extended with Winston or Pino.

## Error Handling

Global error handler middleware in `src/middleware/errorHandler.ts` catches all errors and returns consistent JSON responses.
