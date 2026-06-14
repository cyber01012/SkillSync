SkillSync AI — Member 2 Complete Implementation Guide
For: Cursor AI (Claude/Claude-like coding agent)
Scope: Member 2 — Job Posting + Matching Agent + Application System + Client Dashboard + Freelancer Job Browser Enhancement
Theme: Navy (#133B6C) + Coral (#FD8566) + Warm Peach (#FFF8F5) — Premium Glassmorphism UI
Deadline: 1 Day — Build Fast, Build Clean
CRITICAL RULES (READ FIRST)
DO NOT modify Member 1's existing code — auth, signup, login, JWT, baseline challenge, Skill DNA Agent, freelancer dashboard core
DO NOT modify existing database tables — only ADD new tables/columns if needed
USE EXISTING patterns — apiFetch pattern, CSS variables, component structure
Theme consistency — use ONLY colors from index.css: navy #133B6C, coral #FD8566, sky #5F90D4, warm peach #FFF8F5
Glassmorphism cards — backdrop-blur, gradient backgrounds, subtle borders
Lucide React icons ONLY — no emojis anywhere
All API calls use existing auth pattern — Bearer token from localStorage
Error handling — 401 redirects to /login, show toast/snackbar for errors
PART 1: BACKEND (FastAPI + SQLAlchemy + MongoDB)
Step 1.1: Update schemas.py — Add New Schemas
Add these schemas at the bottom of schemas.py (after existing schemas, before closing):
Python
# ── JOB POSTING (Member 2) ──
class JobPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    required_trust_score: int = Field(default=0, ge=0, le=100)
    min_skill_level: str = "beginner"
    required_tools: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    deadline: Optional[str] = None


class JobPostDetailOut(BaseModel):
    JobID: int
    ClientID: int
    Title: str
    RequiredTrustScore: int
    MinSkillLevel: str
    Status: str
    CreatedAt: Optional[datetime]
    description: Optional[str] = None
    required_tools: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    budget_range: Optional[dict] = None
    client_name: Optional[str] = None
    client_company: Optional[str] = None
    application_count: int = 0
    has_applied: bool = False

    class Config:
        from_attributes = True


class JobWithApplicationsOut(BaseModel):
    JobID: int
    ClientID: int
    Title: str
    RequiredTrustScore: int
    MinSkillLevel: str
    Status: str
    CreatedAt: Optional[datetime]
    applications: List[ApplicationOut] = []

    class Config:
        from_attributes = True


# ── MATCHING (Member 2) ──
class FreelancerMatchOut(BaseModel):
    freelancer_id: int
    display_name: str
    headline: Optional[str]
    category: Optional[str]
    trust_score: float
    match_score: float
    has_baseline_dna: bool
    overall_dna: Optional[float] = None


class MatchResultsOut(BaseModel):
    job_id: int
    total_matches: int
    matches: List[FreelancerMatchOut]


# ── APPLICATION STATUS UPDATE (Member 2) ──
class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(accepted|rejected|pending)$")


# ── CLIENT PROFILE (Member 2) ──
class ClientProfileOut(BaseModel):
    ClientID: int
    CompanyName: Optional[str]
    IndustryID: Optional[int]
    IsVerified: bool
    TrustLevel: str
    email: Optional[str] = None
    total_jobs_posted: int = 0
    total_applications_received: int = 0

    class Config:
        from_attributes = True
Step 1.2: Create backend/app/routers/jobs.py — Complete Job Router
CRITICAL: This REPLACES the existing jobs.py (which only had freelancer browse). The new file has BOTH client posting AND freelancer browsing.
Python
"""Job router — Client posting + Freelancer browsing + Applications + Matching."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_user, get_current_client, get_current_freelancer
from app.models import (
    JobPost, Application, ClientProfile, FreelancerProfile, 
    TrustScore, Category, User, SkillScore
)
from app.schemas import (
    JobPostCreate, JobPostOut, JobPostDetailOut, JobApplyRequest, 
    ApplicationOut, MessageResponse, MatchResultsOut, FreelancerMatchOut,
    ApplicationStatusUpdate
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


# ═══════════════════════════════════════════════════════════════
# FREELANCER: Browse Jobs (Enhanced from Member 1)
# ═══════════════════════════════════════════════════════════════

@router.get("", response_model=List[JobPostDetailOut])
def browse_jobs(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    """Freelancer browses all open jobs with full details."""
    trust = db.query(TrustScore).filter(
        TrustScore.FreelancerID == current_user.UserID
    ).first()
    trust_score = trust.OverallScore if trust else 50.0

    jobs = db.query(JobPost).filter(
        JobPost.Status == "open",
        JobPost.RequiredTrustScore <= trust_score,
    ).order_by(JobPost.CreatedAt.desc()).all()

    mongo_db = get_mongo_db()
    result = []
    for job in jobs:
        brief = mongo_db.task_briefs.find_one({"job_id": job.JobID})
        client = db.query(User, ClientProfile).join(
            ClientProfile, User.UserID == ClientProfile.ClientID
        ).filter(User.UserID == job.ClientID).first()

        has_applied = db.query(Application).filter(
            Application.JobID == job.JobID,
            Application.FreelancerID == current_user.UserID
        ).first() is not None

        app_count = db.query(Application).filter(
            Application.JobID == job.JobID
        ).count()

        result.append(JobPostDetailOut(
            JobID=job.JobID,
            ClientID=job.ClientID,
            Title=job.Title,
            RequiredTrustScore=job.RequiredTrustScore,
            MinSkillLevel=job.MinSkillLevel,
            Status=job.Status,
            CreatedAt=job.CreatedAt,
            description=brief.get("full_description") if brief else None,
            required_tools=brief.get("required_tools") if brief else [],
            tags=brief.get("tags") if brief else [],
            budget_range=brief.get("budget_range") if brief else None,
            client_name=client[0].Username if client else None,
            client_company=client[1].CompanyName if client else None,
            application_count=app_count,
            has_applied=has_applied,
        ))
    return result


@router.get("/{job_id}", response_model=JobPostDetailOut)
def get_job_detail(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single job detail with full info."""
    job = db.query(JobPost).filter(JobPost.JobID == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    mongo_db = get_mongo_db()
    brief = mongo_db.task_briefs.find_one({"job_id": job_id})

    client = db.query(User, ClientProfile).join(
        ClientProfile, User.UserID == ClientProfile.ClientID
    ).filter(User.UserID == job.ClientID).first()

    has_applied = False
    if current_user.Role == "freelancer":
        has_applied = db.query(Application).filter(
            Application.JobID == job_id,
            Application.FreelancerID == current_user.UserID
        ).first() is not None

    app_count = db.query(Application).filter(
        Application.JobID == job_id
    ).count()

    return JobPostDetailOut(
        JobID=job.JobID,
        ClientID=job.ClientID,
        Title=job.Title,
        RequiredTrustScore=job.RequiredTrustScore,
        MinSkillLevel=job.MinSkillLevel,
        Status=job.Status,
        CreatedAt=job.CreatedAt,
        description=brief.get("full_description") if brief else None,
        required_tools=brief.get("required_tools") if brief else [],
        tags=brief.get("tags") if brief else [],
        budget_range=brief.get("budget_range") if brief else None,
        client_name=client[0].Username if client else None,
        client_company=client[1].CompanyName if client else None,
        application_count=app_count,
        has_applied=has_applied,
    )


# ═══════════════════════════════════════════════════════════════
# CLIENT: Post Job (NEW — Member 2)
# ═══════════════════════════════════════════════════════════════

@router.post("", response_model=JobPostOut, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobPostCreate,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client creates a new job post."""
    client_profile = db.query(ClientProfile).filter(
        ClientProfile.ClientID == current_user.UserID
    ).first()
    if not client_profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    job = JobPost(
        ClientID=current_user.UserID,
        Title=data.title,
        RequiredTrustScore=data.required_trust_score,
        MinSkillLevel=data.min_skill_level,
        Status="open",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    mongo_db = get_mongo_db()
    mongo_db.task_briefs.insert_one({
        "job_id": job.JobID,
        "title": data.title,
        "full_description": data.description,
        "required_tools": data.required_tools or [],
        "tags": data.tags or [],
        "budget_range": {
            "min": data.budget_min or 0,
            "max": data.budget_max or 0,
            "currency": "USD"
        },
        "posted_at": datetime.now(timezone.utc).isoformat(),
        "deadline": data.deadline,
        "client_id": current_user.UserID,
    })

    from app.agents.matching_agent import matching_agent_task
    matching_agent_task.delay(job.JobID)

    return job


@router.get("/my/posted", response_model=List[JobPostDetailOut])
def get_my_posted_jobs(
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client views their posted jobs with stats."""
    jobs = db.query(JobPost).filter(
        JobPost.ClientID == current_user.UserID
    ).order_by(JobPost.CreatedAt.desc()).all()

    mongo_db = get_mongo_db()
    result = []
    for job in jobs:
        brief = mongo_db.task_briefs.find_one({"job_id": job.JobID})
        app_count = db.query(Application).filter(
            Application.JobID == job.JobID
        ).count()

        result.append(JobPostDetailOut(
            JobID=job.JobID,
            ClientID=job.ClientID,
            Title=job.Title,
            RequiredTrustScore=job.RequiredTrustScore,
            MinSkillLevel=job.MinSkillLevel,
            Status=job.Status,
            CreatedAt=job.CreatedAt,
            description=brief.get("full_description") if brief else None,
            required_tools=brief.get("required_tools") if brief else [],
            tags=brief.get("tags") if brief else [],
            budget_range=brief.get("budget_range") if brief else None,
            application_count=app_count,
            has_applied=False,
        ))
    return result


@router.put("/{job_id}/close", response_model=MessageResponse)
def close_job(
    job_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client closes a job post."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id,
        JobPost.ClientID == current_user.UserID
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.Status = "closed"
    db.commit()
    return {"message": "Job closed successfully"}


# ═══════════════════════════════════════════════════════════════
# APPLICATIONS (NEW — Member 2)
# ═══════════════════════════════════════════════════════════════

@router.post("/{job_id}/apply", response_model=ApplicationOut)
def apply_to_job(
    job_id: int,
    data: JobApplyRequest,
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    """Freelancer applies to a job."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id, 
        JobPost.Status == "open"
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or closed")

    existing = db.query(Application).filter(
        Application.JobID == job_id,
        Application.FreelancerID == current_user.UserID,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    trust = db.query(TrustScore).filter(
        TrustScore.FreelancerID == current_user.UserID
    ).first()
    if trust and trust.OverallScore < job.RequiredTrustScore:
        raise HTTPException(
            status_code=403, 
            detail=f"Trust score {trust.OverallScore:.1f} below required {job.RequiredTrustScore}"
        )

    application = Application(
        JobID=job_id,
        FreelancerID=current_user.UserID,
        CoverNote=data.cover_note,
        Status="pending",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/{job_id}/applications", response_model=List[ApplicationOut])
def get_job_applications(
    job_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client views applicants for their job."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id,
        JobPost.ClientID == current_user.UserID
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    applications = db.query(Application).filter(
        Application.JobID == job_id
    ).order_by(Application.AppliedAt.desc()).all()
    return applications


@router.put("/applications/{application_id}/status", response_model=ApplicationOut)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client accepts or rejects an application."""
    application = db.query(Application).filter(
        Application.ApplicationID == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.query(JobPost).filter(
        JobPost.JobID == application.JobID,
        JobPost.ClientID == current_user.UserID
    ).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized")

    application.Status = data.status
    db.commit()
    db.refresh(application)
    return application


@router.get("/applications/mine", response_model=List[ApplicationOut])
def my_applications(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    """Freelancer views their applications."""
    apps = db.query(Application).filter(
        Application.FreelancerID == current_user.UserID
    ).order_by(Application.AppliedAt.desc()).all()
    return apps


# ═══════════════════════════════════════════════════════════════
# MATCHING AGENT RESULTS (NEW — Member 2)
# ═══════════════════════════════════════════════════════════════

@router.get("/{job_id}/matches", response_model=MatchResultsOut)
def get_job_matches(
    job_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Get ranked freelancer matches for a job."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id,
        JobPost.ClientID == current_user.UserID
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    mongo_db = get_mongo_db()
    brief = mongo_db.task_briefs.find_one({"job_id": job_id})

    query = db.query(FreelancerProfile, TrustScore).join(
        TrustScore, 
        FreelancerProfile.FreelancerID == TrustScore.FreelancerID
    ).filter(
        FreelancerProfile.AvailabilityStatus == "available",
        TrustScore.OverallScore >= job.RequiredTrustScore,
    )

    freelancers = query.all()

    matches = []
    for profile, trust in freelancers:
        from app.models import DNASnapshot
        latest_dna = db.query(DNASnapshot).filter(
            DNASnapshot.FreelancerID == profile.FreelancerID
        ).order_by(DNASnapshot.TakenAt.desc()).first()

        overall_dna = None
        if latest_dna:
            import json
            try:
                dna_data = json.loads(latest_dna.SnapshotData)
                overall_dna = dna_data.get("overall")
            except:
                pass

        match_score = min(100, trust.OverallScore)
        if profile.HasBaselineDNA:
            match_score += 5
        if overall_dna and overall_dna >= 80:
            match_score += 5
        match_score = min(100, match_score)

        matches.append(FreelancerMatchOut(
            freelancer_id=profile.FreelancerID,
            display_name=profile.DisplayName or "Unknown",
            headline=profile.Headline,
            category=profile.Category,
            trust_score=trust.OverallScore,
            match_score=match_score,
            has_baseline_dna=bool(profile.HasBaselineDNA),
            overall_dna=overall_dna,
        ))

    matches.sort(key=lambda x: x.match_score, reverse=True)

    return MatchResultsOut(
        job_id=job_id,
        total_matches=len(matches),
        matches=matches[:10]
    )
Step 1.3: Create backend/app/agents/matching_agent.py
Python
"""Matching Agent — Pure SQL logic, no AI.
Triggered when a new job is posted.
Ranks freelancers by: Trust Score + DNA fit + Category match."""
from datetime import datetime, timezone

from app.celery_app import celery_app
from app.core.database import SessionLocal, get_mongo_client
from app.core.config import get_settings
from app.models import JobPost, FreelancerProfile, TrustScore, DNASnapshot


@celery_app.task(bind=True, max_retries=3)
def matching_agent_task(self, job_id: int):
    """Run matching algorithm for a job post."""
    db = SessionLocal()
    try:
        job = db.query(JobPost).filter(JobPost.JobID == job_id).first()
        if not job:
            return {"status": "error", "message": "Job not found"}

        settings = get_settings()
        client = get_mongo_client()
        mongo_db = client[settings.mongodb_db]
        brief = mongo_db.task_briefs.find_one({"job_id": job_id})

        job_tags = brief.get("tags", []) if brief else []

        freelancers = db.query(FreelancerProfile, TrustScore).join(
            TrustScore,
            FreelancerProfile.FreelancerID == TrustScore.FreelancerID
        ).filter(
            FreelancerProfile.AvailabilityStatus == "available",
            TrustScore.OverallScore >= job.RequiredTrustScore,
        ).all()

        ranked = []
        for profile, trust in freelancers:
            score = trust.OverallScore

            if profile.HasBaselineDNA:
                score += 10
                latest_dna = db.query(DNASnapshot).filter(
                    DNASnapshot.FreelancerID == profile.FreelancerID
                ).order_by(DNASnapshot.TakenAt.desc()).first()

                if latest_dna:
                    import json
                    try:
                        dna_data = json.loads(latest_dna.SnapshotData)
                        overall = dna_data.get("overall", 0)
                        if overall >= 80:
                            score += 5
                    except:
                        pass

            if profile.Category and any(
                profile.Category.lower() in tag.lower() or tag.lower() in profile.Category.lower()
                for tag in job_tags
            ):
                score += 5

            score = min(100, score)

            ranked.append({
                "freelancer_id": profile.FreelancerID,
                "match_score": score,
                "trust_score": trust.OverallScore,
            })

        ranked.sort(key=lambda x: x["match_score"], reverse=True)

        mongo_db.match_results.update_one(
            {"job_id": job_id},
            {"$set": {
                "job_id": job_id,
                "matches": ranked[:20],
                "total": len(ranked),
                "calculated_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True
        )

        print(f"[MATCHING AGENT] Job {job_id}: {len(ranked)} freelancers ranked")
        if ranked:
            print(f"[MATCHING AGENT] Top match: Freelancer {ranked[0]['freelancer_id']} with score {ranked[0]['match_score']:.1f}")
        else:
            print("[MATCHING AGENT] No matches found")

        return {
            "status": "success",
            "job_id": job_id,
            "total_matches": len(ranked),
            "top_score": ranked[0]["match_score"] if ranked else 0,
        }
    except Exception as e:
        print(f"[MATCHING AGENT] Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
Step 1.4: Update celery_app.py — Add Matching Agent
Add "app.agents.matching_agent" to the include list.
PART 2: FRONTEND
Step 2.1: Create frontend/src/api/jobs.js — Enhanced Job API
JavaScript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw { response: { status: 401 } };
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw { response: { status: res.status, data: err } };
  }
  return res.json();
}

export const jobsApi = {
  browse: () => apiFetch("/api/jobs"),
  get: (id) => apiFetch(`/api/jobs/${id}`),
  apply: (jobId, cover_note = "") =>
    apiFetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify({ cover_note }),
    }),
  myApplications: () => apiFetch("/api/jobs/applications/mine"),
  create: (data) =>
    apiFetch("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  myPosted: () => apiFetch("/api/jobs/my/posted"),
  close: (jobId) =>
    apiFetch(`/api/jobs/${jobId}/close`, { method: "PUT" }),
  getApplicants: (jobId) => apiFetch(`/api/jobs/${jobId}/applications`),
  updateApplicationStatus: (appId, status) =>
    apiFetch(`/api/jobs/applications/${appId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getMatches: (jobId) => apiFetch(`/api/jobs/${jobId}/matches`),
};
Step 2.2: Create frontend/src/pages/PostJob.jsx
Use glassmorphism cards, navy + coral theme, Lucide icons. Include: title, description, trust score slider, skill level buttons, budget inputs, deadline date picker, tool tags selector, custom tags input. On submit, call jobsApi.create() and redirect to client dashboard.
Step 2.3: Create frontend/src/pages/JobDetail.jsx
Two views based on role (from localStorage):
Freelancer view: Job details + Apply form with cover note + "Already Applied" status
Client view: Tabs for Details / Applicants / AI Matches. Applicants table with Accept/Reject buttons. Matches show ranked freelancers with Trust Score rings.
Step 2.4: Enhance frontend/src/pages/JobBrowser.jsx
Add search bar, skill level filter chips, job cards with glassmorphism, tags, budget, application count, "Applied" badge. Click card → navigate to /jobs/:id.
Step 2.5: Create frontend/src/pages/MyApplications.jsx
Freelancer view of all their applications. Status badges (pending/accepted/rejected). Click to view job detail.
Step 2.6: Enhance frontend/src/pages/ClientDashboard.jsx
Replace placeholder cards with real data:
Stats cards: Total Jobs Posted, Total Applications, Active Jobs, Average Match Score
Recent Jobs list with applicant counts
Quick action: "Post New Job" button → navigate to /post-job
AI Matching preview: Top 3 matched freelancers for most recent job
Step 2.7: Update frontend/src/App.jsx — Add New Routes
jsx
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import MyApplications from "./pages/MyApplications";

// Add routes:
<Route path="/post-job" element={<ProtectedRoute allowedRole="client"><PostJob /></ProtectedRoute>} />
<Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
<Route path="/applications" element={<ProtectedRoute allowedRole="freelancer"><MyApplications /></ProtectedRoute>} />
Step 2.8: Update frontend/src/components/common/DashboardSidebar.jsx
Update CLIENT_NAV paths:
jsx
const CLIENT_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/client" },
  { label: "Post Job", icon: Plus, path: "/post-job" },
  { label: "My Jobs", icon: Briefcase, path: "/dashboard/client" },  // or create /my-jobs
  { label: "Applicants", icon: Users, path: "/dashboard/client" },
  { label: "Contracts", icon: FileText, path: "/dashboard/client" },
  { label: "Payments", icon: CreditCard, path: "/dashboard/client" },
];
Update FREELANCER_NAV:
jsx
const FREELANCER_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/freelancer" },
  { label: "Browse Jobs", icon: Briefcase, path: "/jobs" },
  { label: "My Applications", icon: FileText, path: "/applications" },
  { label: "Active Projects", icon: FolderKanban, path: "/projects" },
  { label: "Earnings", icon: DollarSign, path: "/earnings" },
  { label: "Profile Settings", icon: Settings, path: "/profile-settings" },
];
PART 3: DATABASE (No Changes Needed)
Existing tables already support:
JobPosts — job postings
Applications — job applications
MongoDB task_briefs — full job descriptions
Just seed with sample data if needed.
PART 4: TESTING CHECKLIST
Backend:
[ ] POST /api/jobs — Client creates job
[ ] GET /api/jobs — Freelancer browses jobs
[ ] GET /api/jobs/:id — Job detail
[ ] POST /api/jobs/:id/apply — Freelancer applies
[ ] GET /api/jobs/:id/applications — Client views applicants
[ ] PUT /api/jobs/applications/:id/status — Accept/Reject
[ ] GET /api/jobs/:id/matches — AI matching results
[ ] Celery task: matching_agent_task runs on job post
Frontend:
[ ] Client can post job from /post-job
[ ] Freelancer can browse jobs at /jobs
[ ] Freelancer can apply with cover note
[ ] Client sees applicants and can accept/reject
[ ] Client sees AI-ranked matches
[ ] Freelancer sees "My Applications"
[ ] Theme consistent with Member 1's design
END OF MEMBER 2 GUIDE

**IMPLEMENTATION RULE** (Read this):

Read docs/member_2_impl.md and docs/member-handoff.md completely before coding.

Implement Member 2 functionality only.

Preserve all existing Member 1 functionality.

You may modify Member 1 files only when required for:

* integration
* bug fixing
* schema extensions
* route conflicts
* frontend/backend connectivity
* database consistency

Never remove existing APIs, schema fields, tables, routes, models, business logic, dashboards, baseline challenge functionality, DNA agent functionality, or authentication functionality.

Prefer extending existing files instead of replacing them.

Use real SQL Server and MongoDB persistence only.
No mock data.
No hardcoded statistics.
No fake API responses.

All create/update/delete operations must be saved in the database.

All dashboards, job listings, applications, applicant counts, match results, and analytics must load dynamically from the database.

If Redis and Celery are available:

* automatically trigger matching_agent_task after job creation
* ensure failures do not break job creation flow

Before every modification:

* analyze dependencies
* check schema compatibility
* check route conflicts
* preserve backward compatibility

After implementation:

* run backend validation
* run frontend validation
* fix all import errors
* fix all compile errors
* fix all API errors
* fix all build errors
* fix all database integration issues

Required final verification:

* backend starts successfully
* frontend builds successfully
* APIs work
* SQL Server persistence works
* MongoDB persistence works
* no broken imports
* no runtime errors

Provide a final report listing:

1. files created
2. files modified
3. APIs added
4. database changes
5. unresolved issues (if any)

**Before creating any new component, inspect existing components and reuse them whenever possible instead of creating duplicate UI patterns.**
**Refactor all Member 2 pages to use existing design tokens and index.css variables only.**

Do not overwrite existing jobs.py unless absolutely necessary.
Prefer incremental modifications and preserve all existing routes.
