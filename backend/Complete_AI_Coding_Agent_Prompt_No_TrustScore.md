You are an expert full-stack developer implementing the SkillSync AI Member 1 module. You have access to an existing codebase. Read it carefully and build ONLY what is described below. Do not modify existing working code unless necessary.

## READ EXISTING CODEBASE STRUCTURE

```


## EXISTING MODELS (from models.py — DO NOT BREAK THESE)

## EXISTING SCHEMAS (from schemas.py — extend these)



## YOUR TASK: Build These Systems

---

### SYSTEM 1: PROFILE ENHANCEMENT (Freelancer)

After signup, freelancer needs to complete their profile BEFORE accessing dashboard.

**Add to FreelancerProfiles table:**
- `CategoryID` (INT, FK to new Categories table)
- `HasBaselineDNA` (BIT, default 0)
- `Bio` (NVARCHAR(500), nullable)
- `ProfilePhotoURL` (NVARCHAR(500), nullable — stores Cloudinary/local URL)

**New API endpoints:**
- `GET /api/me/profile` — get current freelancer profile (name, headline, bio, photo, category)
- `PUT /api/me/profile` — update profile (bio, display name, headline)
- `POST /api/me/photo` — upload profile photo (save to local uploads/ folder, return URL)

**Frontend:** Profile completion modal/page that appears on first login if profile incomplete.

---

### SYSTEM 2: CATEGORY SELECTION

**New table: Categories**

```sql
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    Domain VARCHAR(50) NOT NULL,        -- 'frontend', 'backend', 'fullstack'
    Specialty VARCHAR(50) NOT NULL,       -- 'react', 'python', 'java', 'nodejs', 'vue', 'css', 'mern', 'python_react'
    DisplayName VARCHAR(100) NOT NULL,    -- 'React Frontend Developer'
    DNAProfileJSON NVARCHAR(MAX) NOT NULL,
    IsActive BIT DEFAULT 1
);
```

**8 categories with DNA weights:**

| Domain | Specialty | Display Name | DNA Weights |
|--------|-----------|-------------|-------------|
| frontend | react | React Frontend Developer | technical:0.25, creativity:0.25, reliability:0.20, communication:0.15, speed:0.05, deadline:0.10 |
| frontend | vue | Vue Frontend Developer | same as react |
| frontend | css | CSS/Tailwind Developer | creativity:0.30, technical:0.25, communication:0.20, reliability:0.10, deadline:0.10, speed:0.05 |
| backend | python | Python Backend Developer | technical:0.30, reliability:0.25, speed:0.15, communication:0.10, creativity:0.10, deadline:0.10 |
| backend | java | Java Backend Developer | same as python |
| backend | nodejs | Node.js Backend Developer | same as python |
| fullstack | mern | MERN Stack Developer | technical:0.28, reliability:0.22, creativity:0.18, communication:0.12, speed:0.10, deadline:0.10 |
| fullstack | python_react | Python + React Developer | same as mern |

**DNAProfileJSON format:**
```json
{
  "traits": ["technical", "creativity", "reliability", "communication", "speed", "deadline"],
  "weights": [0.25, 0.25, 0.20, 0.15, 0.05, 0.10],
  "labels": {
    "technical": "Technical Accuracy",
    "creativity": "Creativity",
    "reliability": "Reliability",
    "communication": "Communication",
    "speed": "Speed",
    "deadline": "Deadline"
  }
}
```

**API endpoints:**
- `GET /api/categories` — list all categories grouped by domain
- `POST /api/me/category` — save selected category to profile

**Frontend:** Category selection page (appears after signup if no category selected). Two-step wizard: Domain → Specialty.

---

### SYSTEM 3: BASELINE CHALLENGE (REBUILD)

**Current baseline.py is basic — rebuild completely.**

**MongoDB: baseline_challenges collection (32 challenges, 4 per category)**

Each challenge document:
```javascript
{
  challenge_id: "BL-PY-001",
  category: "python",
  difficulty: "beginner",  // beginner, intermediate, advanced, expert
  title: "Build a JWT Authentication System",
  description: "Create a FastAPI application with user registration, password hashing, and JWT token generation.",
  time_limit_minutes: 45,
  starter_code: "from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nimport bcrypt\n\napp = FastAPI()\n\nclass UserRegister(BaseModel):\n    email: str\n    password: str\n\n@app.post("/register")\nasync def register(user: UserRegister):\n    # TODO: Implement password hashing and user storage\n    return {"message": "User registered"}",
  test_cases: [
    { name: "test_register_valid_user", input: {email: "alice@example.com", password: "secure123"}, expected_status: 200 },
    { name: "test_password_hashing", input: {email: "bob@example.com", password: "password123"}, validation: "password_is_hashed" },
    { name: "test_jwt_generation", input: {email: "charlie@example.com", password: "jwtpass"}, validation: "returns_jwt_token" }
  ],
  preinstalled_packages: ["fastapi", "pydantic", "bcrypt", "python-jose", "pytest", "httpx"],
  ai_prompt_template: "Evaluate this Python FastAPI code for a JWT authentication system. Rate 0-100 on: 1) Technical Accuracy (correct FastAPI usage, proper error handling, JWT implementation), 2) Creativity (elegant solution, unique approach, clean architecture), 3) Communication (docstrings, comments, variable naming, code clarity). Return ONLY JSON: {\"technical\": X, \"creativity\": Y, \"communication\": Z}",
  language: "python",  // for Monaco editor
  created_at: ISODate()
}
```

**Seed 4 challenges per specialty:**
- BL-PY-001 to BL-PY-004 (Python Backend)
- BL-JV-001 to BL-JV-004 (Java Backend)
- BL-NJ-001 to BL-NJ-004 (Node.js Backend)
- BL-RT-001 to BL-RT-004 (React Frontend)
- BL-VU-001 to BL-VU-004 (Vue Frontend)
- BL-CS-001 to BL-CS-004 (CSS/Tailwind)
- BL-MS-001 to BL-MS-004 (MERN Stack)
- BL-PR-001 to BL-PR-004 (Python + React)

**API endpoints:**
- `GET /api/baseline/challenge` — get next uncompleted challenge for my category
- `POST /api/baseline/start` — create work_session in MongoDB, return session_id
- `POST /api/baseline/step` — record proof-of-work step to MongoDB
- `POST /api/baseline/run` — run code in sandbox, return test results
- `POST /api/baseline/submit` — final submission, trigger AI Scorer + DNA Agent

**Sandbox (`core/sandbox.py`):**
- Restricted subprocess execution
- Memory: 64MB, CPU: 5s, timeout: 10s
- Write code to temp file, run pytest, parse output
- Return: {passed, failed, total, details[], stdout, stderr}

**Proof-of-work recording:**
- MongoDB work_sessions collection
- Record every 2 seconds: {timestamp, action, content, file, cursor_line, cursor_col}
- Actions: code_write, code_edit, test_run, pause, file_switch, submit

---

### SYSTEM 4: AI SCORER (Gemini API with Key Rotation)

**Use Google Gemini API, NOT Claude/OpenAI.**

**Config:** Add to `.env`:
```
GEMINI_API_KEY_1=your-first-key
GEMINI_API_KEY_2=your-second-key
```

**Key rotation logic:** Alternate between keys on each call. If one fails, try the other.

**Celery task: `agents/ai_scorer.py`**
```python
@shared_task(bind=True, max_retries=3)
def ai_scorer_task(session_id: str, code: str, prompt_template: str):
    # 1. Rotate between GEMINI_API_KEY_1 and GEMINI_API_KEY_2
    # 2. Call Gemini API (model: gemini-1.5-flash for speed/cost)
    # 3. Extract JSON: {technical: 85, creativity: 70, communication: 80}
    # 4. Validate (clamp 0-100)
    # 5. Store in MongoDB work_sessions.ai_score
    # 6. Return scores
```

**Gemini API call:**
```python
import google.generativeai as genai

# Rotate keys
keys = [os.getenv("GEMINI_API_KEY_1"), os.getenv("GEMINI_API_KEY_2")]
current_key = keys[session_id_hash % 2]  # or round-robin

genai.configure(api_key=current_key)
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content(prompt)
# Parse JSON from response.text
```

**Fallback:** If both keys fail or no keys set, return {technical: 50, creativity: 50, communication: 50}

---

### SYSTEM 5: SKILL DNA AGENT (Pure Logic — NO AI)

**Celery task: `agents/skill_dna_agent.py`**

**Trigger:** Called after AI Scorer completes (chained Celery tasks)

**What it does (ALL MATH, NO AI):**
1. Fetch work_session from MongoDB by session_id
2. Fetch category DNA profile from SQL Server Categories table
3. Extract: test results, time data, AI scores
4. Calculate 6 RAW scores (0-100 each):
   - RELIABILITY = (tests_passed / tests_total) * 100
   - TECHNICAL = ai_score.technical (or 50 default)
   - SPEED = (time_limit_min * 60000 / duration_ms) * 100, capped at 100
   - COMMUNICATION = ai_score.communication (or 50 default)
   - CREATIVITY = ai_score.creativity (or 50 default)
   - DEADLINE = 100 if on_time else max(0, 100 - (overtime_min * 2))
5. Apply category weights: weighted = raw * weight
6. Calculate overall = sum of all weighted scores
7. Delete old SkillScores for this freelancer+category
8. Insert 6 new SkillScores rows
9. Insert 1 DNASnapshots row with JSON
10. Update FreelancerProfiles.HasBaselineDNA = 1
12. Log to console for academic demo

**Console log format:**
```
[DNA AGENT] Session: ws-abc123
[DNA AGENT] Freelancer: 42
[DNA AGENT] Category: python_backend
[DNA AGENT] Raw: {Technical: 85, Reliability: 100, Speed: 100, Communication: 80, Creativity: 70, Deadline: 100}
[DNA AGENT] Weighted: {Technical: 25.5, Reliability: 25.0, Speed: 15.0, Communication: 8.0, Creativity: 7.0, Deadline: 10.0}
[DNA AGENT] Overall DNA: 90.5
[DNA AGENT] Stored in SQL Server ✓
```

---

### SYSTEM 6: FREELANCER DASHBOARD (REBUILD COMPLETELY)

**Current FreelancerDashboard.jsx is empty — build full dashboard.**

**Layout: Sidebar + Main Content**

**Sidebar navigation:**
- Dashboard (active)
- Browse Jobs
- My Applications
- Active Projects
- Earnings
- Profile Settings

**Main Content sections:**

#### Section 1: Profile Card (Hero)
```
USE LUCIDEREACT ICONS NO EMOJIS
┌─────────────────────────────────────────────────────┐
│  [Profile Photo]  Alice Johnson                    │
│  🏷️ Python Backend Developer                        │
│  📊 DNA: 90.5  |  Challenges: 3/4                   │
│  📝 Bio: "Full-stack developer specializing in..." │
│                                                     │
│  [Edit Profile]  [Retake Challenge]  [Browse Jobs] │
└─────────────────────────────────────────────────────┘
```
- Profile photo: circular, default avatar if none uploaded
- Photo upload: click to upload, preview before save
- Bio: editable text area, max 500 chars
- Display name, headline editable

#### Section 2: Skill DNA Card
- Radar chart (recharts) showing 6 traits
- Overall DNA score
- Each trait: weighted score / max possible (e.g., "25.5/30")
- On hover: show raw score (e.g., "raw: 85")
- Category badge (e.g., "Python Backend")

#### Section 3: DNA Timeline
- Line chart (recharts) showing DNA growth
- X-axis: Challenge 1, Challenge 2, Challenge 3
- Y-axis: Overall score (0-100)
- Lines: Overall, Technical, Reliability

#### Section 4: Activity Feed
- Recent actions with icons
- Challenge completions with score changes
- DNA snapshot updates

---


### SYSTEM 8: CLIENT DASHBOARD (Basic Shell)

**Current ClientDashboard.jsx exists — just add sidebar + basic layout.**

**Sidebar:** Post Job, My Jobs, Applicants, Contracts, Payments

**Main content:** Placeholder cards for each section.

**NO DNA, NO CHALLENGES for clients.**

---

### SYSTEM 9: BASELINE CHALLENGE PAGE (FULL WORKSPACE UI)

**The baseline challenge page is NOT just Monaco editor. It's a full workspace:**

```
┌─────────────────────────────────────────────────────────────┐
│  Challenge: Build a JWT Authentication System                 │
│  Category: Python Backend  |  ⏱️ 38:42 remaining            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌─────────────────────────────────────┐     │
│  │ FILES    │  │  MONACO EDITOR                      │     │
│  │          │  │                                     │     │
│  │ 📄 main.py│  │  1  from fastapi import FastAPI,   │     │
│  │ 📄 test_ │  │  2      HTTPException                │     │
│  │    main.py│  │  3  from pydantic import BaseModel   │     │
│  │          │  │  4  import bcrypt                    │     │
│  │ [+ New]  │  │  5                                   │     │
│  │          │  │  6  app = FastAPI()                  │     │
│  │          │  │  7                                   │     │
│  │          │  │  8  class UserRegister(BaseModel):     │     │
│  │          │  │  9      email: str                     │     │
│  │          │  │  10     password: str                   │     │
│  │          │  │  11                                  │     │
│  │          │  │  12  @app.post("/register")            │     │
│  │          │  │  13  async def register(user:          │     │
│  │          │  │  14      UserRegister):                │     │
│  │          │  │  15      # TODO: Hash password        │     │
│  │          │  │  16      return {"message": "OK"}     │     │
│  │          │  │  17                                  │     │
│  │          │  │  18  # 💡 Hint: Use bcrypt.hashpw()  │     │
│  └──────────┘  └─────────────────────────────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  INSTRUCTIONS          │  TEST RESULTS               │   │
│  │  ─────────────────────  │  ─────────────────────────   │   │
│  │  Build a FastAPI app    │  ✅ test_register_valid      │   │
│  │  with:                  │     ... PASSED (0.3s)       │   │
│  │  • /register endpoint   │  ❌ test_password_hashing   │   │
│  │  • Password hashing     │     ... FAILED (0.1s)       │   │
│  │  • JWT generation       │     AssertionError: not     │   │
│  │                         │     hashed                   │   │
│  │  Requirements:          │  ⏳ test_jwt_generation      │   │
│  │  - Validate email       │     ... NOT RUN              │   │
│  │  - Hash with bcrypt     │                              │   │
│  │  - Return JWT token     │                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [▶ Run Tests]  [💾 Save Draft]  [📤 Submit Solution]      │
│                                                             │
│  ⚠️ Warning: Submitting ends the challenge. You cannot      │
│     retake until 24 hours later.                            │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Description |
|-----------|-------------|
| **Top Bar** | Challenge title, category badge, countdown timer |
| **Left Panel** | File tabs (main.py, test_main.py) — clickable to switch files |
| **Center** | Monaco editor (code editing) with syntax highlighting for the challenge language |
| **Bottom Left** | Instructions panel — task description, requirements list, hints |
| **Bottom Right** | Test results panel — pass/fail display with details, stdout/stderr |
| **Action Bar** | Run Tests, Save Draft, Submit Solution buttons |

**Timer Logic:**
```javascript
// Timer counts down from challenge.time_limit_minutes * 60
// Under 5 minutes: turns red, shows warning animation
// At 0:00: auto-submits current code (POST /api/baseline/submit)
// Records: started_at, completed_at, duration_ms, on_time (boolean)
// Timer runs in useEffect with setInterval(1000)
```

**Challenge Assignment Logic:**
```javascript
// GET /api/baseline/challenge returns next uncompleted challenge
// Logic: Find all challenges for freelancer's category
// Filter out completed ones (check ChallengeResults table)
// Return first uncompleted, ordered by difficulty (beginner → intermediate → advanced → expert)
// If all 4 completed: return "all_completed" flag, show "Retake" option
// Each challenge has: challenge_id, title, description, starter_code, test_cases, time_limit_minutes
// freelancer is required to complete only one challenge on sign up. But if they retake the challenge then it isnt repeated, difficulty increases.
```

**File Tabs:**
```javascript
// Two tabs minimum: main.py (editable) and test_main.py (read-only)
// Click tab to switch active file in Monaco editor
// test_main.py shows the actual tests that will be run
// [+ New] button to create additional files (stored in work_session.files)
```

**Test Results Panel:**
```javascript
// After Run Tests: show list of test cases
// Each test: name, status (passed/failed/not_run), duration, error message
// Green checkmark for passed, red X for failed, gray circle for not run
// Expandable: click to see stdout/stderr for that test
```

**Instructions Panel:**
```javascript
// Markdown-rendered description
// Bullet list of requirements
// Hints section (collapsible)
// Difficulty badge (beginner/intermediate/advanced/expert)
// Time limit display
```

**Action Bar:**
```javascript
// [▶ Run Tests] — POST /api/baseline/run with current code
// [💾 Save Draft] — POST /api/baseline/step with action "save_draft"
// [📤 Submit Solution] — POST /api/baseline/submit, then redirect to dashboard
// Submit button shows confirmation modal: "This will end the challenge. Are you sure?"
// After submit: show loading spinner "AI Scoring in progress..." then redirect
```

**Proof-of-Work Recording:**
```javascript
// Every 2 seconds while editor is focused:
// POST /api/baseline/step with:
// { timestamp, action: "code_write", content: "...", file: "main.py", cursor_line, cursor_col }
// On Run Tests: action "test_run"
// On Pause (tab hidden): action "pause"
// On File switch: action "file_switch"
// On Submit: action "submit"
```

---

### SYSTEM 10: AUTH MANAGEMENT (Logout, Logout All Devices, Change Password Backend is present)

// Connect it to dashboards if not present


**Frontend (both Freelancer and Client dashboards):**

**In sidebar**
```javascript
// User dropdown menu (click profile photo/name):
// ┌─────────────────────┐
// │ 👤 Alice Johnson    │
// │ alice@example.com   │
// ├─────────────────────┤
// │ Profile Settings    │
// │ Change Password     │
// ├─────────────────────┤
// │ Log Out             │
// │ Log Out All Devices │
// └─────────────────────┘
```

**Change Password Modal:**
```javascript
// Form fields:
// - Current Password (password input, required)
// - New Password (password input, min 8 chars, required)
// - Confirm New Password (must match new password)
// Validation: show error if passwords don't match or < 8 chars
// On submit: POST /api/auth/change-password
// Success: show toast "Password changed successfully"
// Error: show error message from backend
```

**Logout behavior:**
```javascript
// On Log Out: POST /api/auth/logout, clear localStorage token, redirect to / (landing page)
// On Log Out All Devices: POST /api/auth/logout-all, clear localStorage token, redirect to /
// Redirect MUST happen automatically — use window.location.href = "/" or navigate("/")
```

---

## FLOW LOGIC

```
Freelancer Signup
    |
    v
Complete Profile (name, bio, photo, category)
    |
    v
Has DNA? (HasBaselineDNA = 1?)
    |
    +-- NO --> Baseline Challenge (Monaco IDE Workspace)
    |            |
    |            v
    |         Submit --> AI Scorer --> DNA Agent --> Dashboard
    |
    +-- YES --> Dashboard
                    |
                    +-- Browse Jobs
                    +-- My Applications
                    +-- Retake Challenge
                    +-- Edit Profile
                    +-- Change Password
                    +-- Log Out / Log Out All
```

---

## END-TO-END CONNECTION RULES (CRITICAL)

**Backend and frontend MUST remain fully connected:**

1. **Dashboard fetches real data:**
   - Profile card: `GET /api/me/profile`
   - DNA radar chart: `GET /api/dna/scores`
   - DNA timeline: `GET /api/dna/snapshots`
   - Activity feed: `GET /api/dna/activity` (or derive from ChallengeResults + DNASnapshots)
   - 

2. **All API calls use existing auth pattern:**
   - Include `Authorization: Bearer <token>` header
   - Use existing `api/auth.js` axios instance pattern
   - Handle 401 by redirecting to /login

3. **State management:**
   - Use React useState + useEffect for data fetching
   - Show loading skeletons while data loads
   - Show error states with retry buttons
   - Re-fetch after mutations (invalidate cache manually)

4. **Navigation guards:**
   - Protected routes check token in localStorage
   - If no token → redirect to /login
   - If freelancer tries client route → redirect to /dashboard/freelancer
   - If client tries freelancer route → redirect to /dashboard/client

5. **Real-time updates:**
   - After challenge submit, poll `GET /api/dna/scores` until DNA is calculated
   - Show "DNA processing..." spinner while Celery tasks run
   - Auto-refresh dashboard data on page focus

---

## THEME RULES (CRITICAL)

1. Use ONLY existing CSS variables from index.css
2. Background: var(--background)
3. Cards: var(--card) with border: 1px solid var(--border)
4. Text: var(--text), muted: var(--text-muted)
5. Buttons: var(--primary), hover: var(--primary-hover)
6. Success: var(--success), Error: var(--error)
7. Font: var(--font-sans), Code: var(--font-mono)
8. Border radius: var(--radius-lg)
9. Dark theme ONLY — no light mode
10. Match existing landing page aesthetic

---

## FILE DELIVERABLES

### Backend (new/modified files):
1. `app/models.py` — add Categories, JobPosts, Applications, modify FreelancerProfile
2. `app/schemas.py` — add new schemas
3. `app/routers/categories.py` — category endpoints
4. `app/routers/baseline.py` — REBUILD challenge endpoints
5. `app/routers/dna.py` — extend with has-dna check
6. `app/routers/jobs.py` — job browser endpoints
7. `app/routers/profile.py` — profile photo, bio, update
8. `app/routers/auth.py` — ADD logout, logout-all, change-password endpoints
9. `app/agents/skill_dna_agent.py` — DNA calculation (pure logic)
10. `app/agents/ai_scorer.py` — Gemini API scorer (key rotation)
11. `app/core/sandbox.py` — code execution sandbox
12. `app/seed/seed_sqlserver.py` — add Categories, JobPosts, Applications seed
13. `app/seed/seed_mongodb.py` — add 32 baseline_challenges

### Frontend (new/modified files):
1. `src/pages/CategorySelection.jsx` — category picker
2. `src/pages/BaselineChallenge.jsx` — REBUILD full Monaco IDE workspace
3. `src/pages/FreelancerDashboard.jsx` — REBUILD full dashboard
4. `src/pages/ClientDashboard.jsx` — ADD sidebar + basic layout + auth menu
5. `src/pages/JobBrowser.jsx` — browse jobs
6. `src/pages/ProfileSettings.jsx` — edit profile, photo, bio
7. `src/components/category/DomainSelection.jsx`
8. `src/components/category/SpecialtyGrid.jsx`
9. `src/components/challenge/MonacoIDE.jsx`
10. `src/components/challenge/TestPanel.jsx`
11. `src/components/challenge/Timer.jsx`
12. `src/components/challenge/InstructionsPanel.jsx`
13. `src/components/challenge/FileTabs.jsx`
14. `src/components/challenge/ActionBar.jsx`
15. `src/components/dashboard/SkillDNACard.jsx` — radar chart
17. `src/components/dashboard/DNATimeline.jsx` — line chart
18. `src/components/dashboard/ActivityFeed.jsx`
19. `src/components/dashboard/ProfileCard.jsx`
20. `src/components/dashboard/AuthMenu.jsx` — logout, change password dropdown
21. `src/components/jobs/JobCard.jsx`
22. `src/api/categories.js`
23. `src/api/baseline.js`
24. `src/api/dna.js`
25. `src/api/jobs.js`
26. `src/api/profile.js`
27. `src/api/auth.js` — ADD logout, logoutAll, changePassword functions

### Install dependencies:
```bash
cd frontend
npm install @monaco-editor/react recharts

cd backend
pip install google-generativeai celery redis
```

---

## CRITICAL RULES

1. **DO NOT modify existing auth system** (signup, login, JWT, protected routes,logout/logout-all/change-password) 
2. **DO NOT modify existing landing page**
3. **Use existing database connection patterns** (get_db, get_mongo_db)
4. **Use existing JWT dependency** (get_current_freelancer)
5. **Use existing CSS variables** — no new colors
6. **DNA Agent is PURE LOGIC** — no AI, no API calls, just math
7. **AI Scorer uses Gemini ONLY** — key rotation between 2 keys
8. **Seed all data** — system works immediately after `python seed_all.py`
9. **Console log DNA Agent** for academic demonstration
10. **Match existing code style** — SQLAlchemy patterns, Pydantic schemas, FastAPI routers
11. **End-to-end connected** — dashboard fetches real data, forms submit to real APIs, navigation guards work
12. **Logout redirects to landing page** — both logout and logout-all
13. **Change password works on both dashboards** — freelancer and client
