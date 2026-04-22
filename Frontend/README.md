# Umurava AI Hackathon — Frontend

AI-powered talent screening platform. Built by **HerCode Team** 🚀

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Run in development (mock data — no backend needed)
npm run dev

# App opens at http://localhost:3000
```

## Pages

| Route | Description | Redux Slice |
|-------|-------------|-------------|
| `/` | Dashboard — stats + recent jobs | `jobs`, `screening` |
| `/jobs` | Job listings with filter/search | `jobs` |
| `/jobs/create` | Create job form (auto-saves draft) | `jobs` |
| `/screen?jobId=X` | Select applicants + run AI screening | `applicants`, `screening` |
| `/shortlist?jobId=X` | AI shortlist — ranked with Gemini reasoning | `screening` |

## Redux Architecture

```
store/
  jobsSlice.ts        — fetchJobs, createJob, updateJob, deleteJob
  applicantsSlice.ts  — fetchByJob, uploadCsv, uploadResumes, select/toggle
  screeningSlice.ts   — runScreening (calls Gemini), fetchResults

  index.ts            — configureStore + typed hooks
  ReduxProvider.tsx   — wraps the app
```

### How to use Redux in any component

```tsx
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchJobs, selectAllJobs } from '@/store/jobsSlice'

export default function MyComponent() {
  const dispatch = useAppDispatch()
  const jobs = useAppSelector(selectAllJobs)

  useEffect(() => { dispatch(fetchJobs()) }, [dispatch])
  // ...
}
```

## Connecting to Backend

When backend is ready:

1. Set in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   NEXT_PUBLIC_USE_MOCK=false
   ```

2. The API service files already have the correct endpoint paths:
   - `GET  /api/jobs`
   - `POST /api/jobs`
   - `GET  /api/jobs/:id/applicants`
   - `POST /api/jobs/:jobId/applicants/upload-csv`
   - `POST /api/screening/run`  ← triggers Gemini AI
   - `GET  /api/screening/results/:jobId`

## What Gemini AI Returns (ScreeningResult shape)

```ts
{
  jobId: string
  totalScreened: number
  shortlist: [
    {
      rank: number
      applicantName: string
      matchScore: number        // 0–100
      reasoning: string         // natural language paragraph
      strengths: string[]       // ["Python", "5yr exp", ...]
      gaps: string[]            // ["No MLOps", ...]
      recommendation: string    // "Highly recommended..."
    }
  ]
}
```

## Project Structure

```
src/
  types/index.ts          — All TypeScript types
  lib/
    axios.ts              — API client
    mockData.ts           — Mock data (used when NEXT_PUBLIC_USE_MOCK=true)
  services/
    jobsApi.ts
    applicantsApi.ts
    screeningApi.ts
  store/
    jobsSlice.ts
    applicantsSlice.ts
    screeningSlice.ts
    index.ts
    ReduxProvider.tsx
  components/
    Sidebar.tsx
    Topbar.tsx
  app/
    globals.css           — Umurava brand tokens + all component styles
    layout.tsx            — Root layout (Redux + Sidebar)
    page.tsx              — Dashboard
    jobs/page.tsx         — Job listings
    jobs/create/page.tsx  — Create job
    screen/page.tsx       — Screen applicants
    shortlist/page.tsx    — Shortlist results
```