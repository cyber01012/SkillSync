"""Job browser endpoints for freelancers."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies import get_current_freelancer
from app.models import JobPost, Application, ClientProfile, TrustScore
from app.schemas import JobPostOut, JobApplyRequest, ApplicationOut, MessageResponse

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobPostOut])
def browse_jobs(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    trust = db.query(TrustScore).filter(
        TrustScore.FreelancerID == current_user.UserID
    ).first()
    trust_score = trust.OverallScore if trust else 50.0

    jobs = db.query(JobPost).filter(
        JobPost.Status == "open",
        JobPost.RequiredTrustScore <= trust_score,
    ).order_by(JobPost.CreatedAt.desc()).all()
    return jobs


@router.get("/applications/mine", response_model=List[ApplicationOut])
def my_applications(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    apps = db.query(Application).filter(
        Application.FreelancerID == current_user.UserID
    ).order_by(Application.AppliedAt.desc()).all()
    return apps


@router.get("/{job_id}", response_model=JobPostOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobPost).filter(JobPost.JobID == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/{job_id}/apply", response_model=ApplicationOut)
def apply_to_job(
    job_id: int,
    data: JobApplyRequest,
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    job = db.query(JobPost).filter(JobPost.JobID == job_id, JobPost.Status == "open").first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or closed")

    existing = db.query(Application).filter(
        Application.JobID == job_id,
        Application.FreelancerID == current_user.UserID,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    app = Application(
        JobID=job_id,
        FreelancerID=current_user.UserID,
        CoverNote=data.cover_note,
        Status="pending",
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app
