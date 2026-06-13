# SkillSync AI — Member 2 Handoff Document

## What Member 1 Built (You Receive This)

### Working System
- Full auth: register/login with JWT
- Role selection: Freelancer or Client
- Freelancer dashboard with Skill DNA visualization
- Baseline challenge system (proof-of-work recording)
- Skill DNA Agent (auto-fires on challenge completion)
- All databases seeded with sample data

### API Endpoints Already Working
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/profile` | Freelancer profile |
| GET | `/api/baseline/challenge` | Get challenges |
| POST | `/api/baseline/submit` | Submit challenge |
| GET | `/api/baseline/results` | Get results |
| GET | `/api/dna/scores` | 6 DNA traits |
| GET | `/api/dna/trust-score` | Trust score |
| GET | `/api/dna/snapshots` | DNA history |

### Database State
- SQL Server: 6 users, 3 freelancers with DNA, 2 clients, 4 jobs, 6 challenge results
- MongoDB: work_sessions, task_briefs, messages, submissions, behavioral_logs, fraud_logs, rubric_templates

---

## What You Build (Member 2 Scope)

### 1. Job Posting System
**Backend:**
- `POST /api/jobs` — Client creates job (stores in SQL Server + MongoDB task_briefs)
- `GET /api/jobs` — List all open jobs
- `GET /api/jobs/:id` — Single job detail
- `GET /api/jobs/my` — Client's posted jobs

**Frontend:**
- Update `ClientDashboard.jsx` — replace placeholder with real job posting form
- `pages/PostJob.jsx` — Job creation form
- `pages/JobDetail.jsx` — View single job

**DB Concepts:**
- DML (INSERT, SELECT)
- JOIN (jobs + client info)

---

### 2. Matching Agent
**Backend:**
- `app/agents/matching_agent.py` — Celery task
- Trigger: New job post created
- Action: Query freelancers, score by:
  - Skill DNA fit (trait overlap)
  - Trust Score >= RequiredTrustScore
  - Category match
- Returns ranked shortlist

**Frontend:**
- `components/dashboard/MatchResults.jsx` — Show ranked freelancers to client

**API:**
- `GET /api/jobs/:id/matches` — Get ranked freelancers for a job

**DB Concepts:**
- JOIN (multiple tables)
- Subqueries (filtering)
- Views (`vw_job_matches` — create this)

---

### 3. Application System
**Backend:**
- `POST /api/jobs/:id/apply` — Freelancer applies
- `GET /api/jobs/:id/applications` — Client views applicants
- `PUT /api/applications/:id/status` — Client accepts/rejects

**Frontend:**
- Freelancer can browse jobs and apply
- Client sees applicants on job detail

**DB Concepts:**
- DML (INSERT, UPDATE)
- Transactions (TCL — BEGIN TRAN, COMMIT)

---

### 4. Live Challenge System
**Backend:**
- `POST /api/challenges/:id/start` — Start timed challenge
- WebSocket or polling for real-time recording
- `POST /api/challenges/:id/submit` — Submit with step recording

**Frontend:**
- `pages/LiveChallenge.jsx` — Timed challenge with step tracking

**MongoDB:**
- Stores step-by-step recording in `work_sessions`

---

## Files You Create

### Backend
backend/app/routers/jobs.py
backend/app/routers/applications.py
backend/app/routers/challenges.py
backend/app/agents/matching_agent.py
backend/seed/seed_sqlserver.py  ← ADD sample jobs, applications
plain

### Frontend
frontend/src/api/jobs.js
frontend/src/api/applications.js
frontend/src/pages/PostJob.jsx
frontend/src/pages/JobDetail.jsx
frontend/src/pages/JobList.jsx
frontend/src/components/dashboard/MatchResults.jsx
frontend/src/components/dashboard/JobCard.jsx
plain

---

## Database Schema You Use (Already Exists)

### SQL Server Tables (use these)
```sql
JobPosts(JobID, ClientID, Title, RequiredTrustScore, MinSkillLevel, Status, CreatedAt)
Applications(ApplicationID, JobID, FreelancerID, CoverNote, Status, AppliedAt)
Contracts(ContractID, JobID, FreelancerID, ClientID, TotalAmount, Status)
MongoDB Collections (use these)
JavaScript
task_briefs: {job_id, title, full_description, required_tools[], tags[], posted_at}
work_sessions: {session_id, freelancer_id, challenge_id, steps:[], duration_ms}