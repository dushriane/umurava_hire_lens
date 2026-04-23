# 🚀 Umurava HireLens AI

**Transparent AI-powered candidate screening for smarter hiring decisions**

---

## 📌 Project Overview

**Umurava HireLens AI** is an intelligent recruitment assistant designed to help recruiters efficiently screen, evaluate, and shortlist candidates using AI—while keeping humans in control of final hiring decisions.

The platform addresses two major challenges in recruitment:

* Handling **high volumes of applications**
* Ensuring **fair and objective candidate comparison**

By combining structured talent profiles with AI-powered analysis, HireLens provides:

* Ranked candidate shortlists
* Clear, explainable reasoning
* Faster and more confident decision-making

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

* Structured talent profile input (based on provided schema)
* Support for CSV / manual entry
* Resume upload (optional enhancement)

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

* Next.js
* Tailwind CSS
* Redux Toolkit

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
