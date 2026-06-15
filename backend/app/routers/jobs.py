"""Job router — Client posting + Freelancer browsing + Applications + Matching."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_user, get_current_client, get_current_freelancer
from app.models import (
    JobPost,
    Application,
    ClientProfile,
    FreelancerProfile,
    TrustScore,
    User,
    DNASnapshot,
)
from app.schemas import (
    JobPostCreate,
    JobPostOut,
    JobPostDetailOut,
    JobApplyRequest,
    ApplicationOut,
    ApplicationWithFreelancerOut,
    MessageResponse,
    MatchResultsOut,
    FreelancerMatchOut,
    ApplicationStatusUpdate,
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def _build_job_detail(
    job: JobPost,
    db: Session,
    mongo_db,
    *,
    has_applied: bool = False,
) -> JobPostDetailOut:
    brief = mongo_db.task_briefs.find_one({"job_id": job.JobID})
    client = db.query(User, ClientProfile).join(
        ClientProfile, User.UserID == ClientProfile.ClientID
    ).filter(User.UserID == job.ClientID).first()

    app_count = db.query(Application).filter(
        Application.JobID == job.JobID
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
        has_applied = db.query(Application).filter(
            Application.JobID == job.JobID,
            Application.FreelancerID == current_user.UserID,
        ).first() is not None
        result.append(_build_job_detail(job, db, mongo_db, has_applied=has_applied))
    return result


# ═══════════════════════════════════════════════════════════════
# CLIENT: Post Job (NEW — Member 2)
# ═══════════════════════════════════════════════════════════════

@router.post("", response_model=JobPostOut, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobPostCreate,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    print(f"DEBUG: UserID={current_user.UserID}, Role={current_user.Role}")
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
            "currency": "USD",
        },
        "posted_at": datetime.now(timezone.utc).isoformat(),
        "deadline": data.deadline,
        "client_id": current_user.UserID,
    })

    try:
        from app.agents.matching_agent import matching_agent_task
        matching_agent_task.delay(job.JobID)
    except Exception:
        pass

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
    return [_build_job_detail(job, db, mongo_db, has_applied=False) for job in jobs]


# ═══════════════════════════════════════════════════════════════
# APPLICATIONS (NEW — Member 2)
# Static routes before /{job_id} to avoid path conflicts.
# ═══════════════════════════════════════════════════════════════

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
        JobPost.ClientID == current_user.UserID,
    ).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized")

    application.Status = data.status
    db.commit()
    db.refresh(application)
    return application


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

    has_applied = False
    if current_user.Role == "freelancer":
        has_applied = db.query(Application).filter(
            Application.JobID == job_id,
            Application.FreelancerID == current_user.UserID,
        ).first() is not None

    mongo_db = get_mongo_db()
    return _build_job_detail(job, db, mongo_db, has_applied=has_applied)


@router.put("/{job_id}/close", response_model=MessageResponse)
def close_job(
    job_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client closes a job post."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id,
        JobPost.ClientID == current_user.UserID,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    job.Status = "closed"
    db.commit()
    return {"message": "Job closed successfully"}


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
        JobPost.Status == "open",
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
            detail=f"Trust score {trust.OverallScore:.1f} below required {job.RequiredTrustScore}",
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


# @router.get("/{job_id}/applications", response_model=List[ApplicationOut])
# def get_job_applications(
#     job_id: int,
#     current_user=Depends(get_current_client),
#     db: Session = Depends(get_db),
# ):
#     """Client views applicants for their job."""
#     job = db.query(JobPost).filter(
#         JobPost.JobID == job_id,
#         JobPost.ClientID == current_user.UserID,
#     ).first()
#     if not job:
#         raise HTTPException(status_code=404, detail="Job not found or not yours")

#     # JOIN with FreelancerProfile and TrustScore to get name + trust score
#     applications = db.query(
#         Application, FreelancerProfile, TrustScore
#     ).join(
#         FreelancerProfile, Application.FreelancerID == FreelancerProfile.FreelancerID
#     ).outerjoin(
#         TrustScore, FreelancerProfile.FreelancerID == TrustScore.FreelancerID
#     ).filter(
#         Application.JobID == job_id
#     ).order_by(Application.AppliedAt.desc()).all()

#     result = []
#     for app, profile, trust in applications:
#         # Build response with freelancer info
#         app_dict = {
#             "ApplicationID": app.ApplicationID,
#             "JobID": app.JobID,
#             "FreelancerID": app.FreelancerID,
#             "CoverNote": app.CoverNote,
#             "Status": app.Status,
#             "AppliedAt": app.AppliedAt,
#             "freelancer_name": profile.DisplayName or "Unknown",
#             "freelancer_headline": profile.Headline or "",
#             "trust_score": trust.OverallScore if trust else 0.0,
#             "has_baseline_dna": profile.HasBaselineDNA or False,
#         }
#         result.append(app_dict)
#     return result
@router.get("/{job_id}/applications", response_model=List[ApplicationWithFreelancerOut])
def get_job_applications(
    job_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client views applicants for their job with freelancer names."""
    job = db.query(JobPost).filter(
        JobPost.JobID == job_id,
        JobPost.ClientID == current_user.UserID,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    # JOIN Applications with FreelancerProfiles to get names
    applications = db.query(
        Application.ApplicationID,
        Application.JobID,
        Application.FreelancerID,
        FreelancerProfile.DisplayName.label("FreelancerName"),
        FreelancerProfile.Headline.label("FreelancerHeadline"),
        Application.CoverNote,
        Application.Status,
        Application.AppliedAt,
    ).join(
        FreelancerProfile,
        Application.FreelancerID == FreelancerProfile.FreelancerID
    ).filter(
        Application.JobID == job_id
    ).order_by(Application.AppliedAt.desc()).all()

    return applications

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
        JobPost.ClientID == current_user.UserID,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    query = db.query(FreelancerProfile, TrustScore).join(
        TrustScore,
        FreelancerProfile.FreelancerID == TrustScore.FreelancerID,
    ).filter(
        FreelancerProfile.AvailabilityStatus == "available",
        TrustScore.OverallScore >= job.RequiredTrustScore,
    )

    freelancers = query.all()

    matches = []
    for profile, trust in freelancers:
        latest_dna = db.query(DNASnapshot).filter(
            DNASnapshot.FreelancerID == profile.FreelancerID
        ).order_by(DNASnapshot.TakenAt.desc()).first()

        overall_dna = None
        if latest_dna:
            try:
                dna_data = json.loads(latest_dna.SnapshotData)
                overall_dna = dna_data.get("overall")
            except (json.JSONDecodeError, TypeError):
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
        matches=matches[:10],
    )
