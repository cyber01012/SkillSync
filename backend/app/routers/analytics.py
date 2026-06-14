"""Analytics router — Platform KPIs, rankings, job analytics."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_user
from app.models import (
    User, FreelancerProfile, ClientProfile, JobPost, Contract,
    Milestone, PaymentEvent, TrustScore, Application, ChallengeResult
)
from app.schemas import PlatformKPIsOut, FreelancerRankingOut, JobAnalyticsOut

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# ═══════════════════════════════════════════════════════════════
# PLATFORM KPIs
# ═══════════════════════════════════════════════════════════════

@router.get("/platform", response_model=PlatformKPIsOut)
def get_platform_kpis(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get platform-wide analytics and KPIs."""
    # User counts
    total_users = db.query(User).count()
    total_freelancers = db.query(User).filter(User.Role == "freelancer").count()
    total_clients = db.query(User).filter(User.Role == "client").count()

    # Job stats
    total_jobs = db.query(JobPost).count()
    active_jobs = db.query(JobPost).filter(JobPost.Status == "open").count()

    # Contract stats
    total_contracts = db.query(Contract).count()
    completed_contracts = db.query(Contract).filter(Contract.Status == "completed").count()

    # Revenue
    total_revenue = db.query(func.sum(PaymentEvent.Amount)).filter(
        PaymentEvent.EventType == "payment_released"
    ).scalar() or 0.0

    # Trust scores
    avg_trust = db.query(func.avg(TrustScore.OverallScore)).scalar() or 0.0

    # Completion rate
    completion_rate = (completed_contracts / max(total_contracts, 1)) * 100

    # Top freelancers
    top_freelancers = db.query(
        FreelancerProfile, TrustScore
    ).join(
        TrustScore, FreelancerProfile.FreelancerID == TrustScore.FreelancerID
    ).order_by(
        desc(TrustScore.OverallScore)
    ).limit(5).all()

    top_list = []
    for rank, (profile, trust) in enumerate(top_freelancers, 1):
        completed = db.query(Contract).filter(
            Contract.FreelancerID == profile.FreelancerID,
            Contract.Status == "completed",
        ).count()
        top_list.append({
            "rank": rank,
            "freelancer_id": profile.FreelancerID,
            "display_name": profile.DisplayName or "Unknown",
            "trust_score": trust.OverallScore,
            "completed_contracts": completed,
            "category": profile.Category,
        })

    # Recent payments from MongoDB
    mongo_db = get_mongo_db()
    recent_payments = list(mongo_db.payment_records.find(
        {}, {"_id": 0}
    ).sort("released_at", -1).limit(5))

    # Monthly growth (simplified)
    monthly_growth = [
        {"month": "2026-01", "new_users": 12, "new_contracts": 3, "revenue": 5000},
        {"month": "2026-02", "new_users": 18, "new_contracts": 5, "revenue": 8500},
        {"month": "2026-03", "new_users": 25, "new_contracts": 8, "revenue": 12000},
        {"month": "2026-04", "new_users": 30, "new_contracts": 12, "revenue": 18000},
        {"month": "2026-05", "new_users": 22, "new_contracts": 10, "revenue": 15000},
        {"month": "2026-06", "new_users": 15, "new_contracts": 7, "revenue": 11000},
    ]

    return PlatformKPIsOut(
        total_users=total_users,
        total_freelancers=total_freelancers,
        total_clients=total_clients,
        total_jobs=total_jobs,
        total_contracts=total_contracts,
        total_revenue=total_revenue,
        avg_trust_score=round(avg_trust, 2),
        completion_rate=round(completion_rate, 2),
        top_freelancers=top_list,
        recent_payments=recent_payments,
        monthly_growth=monthly_growth,
    )


# ═══════════════════════════════════════════════════════════════
# FREELANCER RANKINGS
# ═══════════════════════════════════════════════════════════════

@router.get("/rankings", response_model=List[FreelancerRankingOut])
def get_freelancer_rankings(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get ranked list of all freelancers."""
    freelancers = db.query(
        FreelancerProfile, TrustScore
    ).join(
        TrustScore, FreelancerProfile.FreelancerID == TrustScore.FreelancerID
    ).order_by(
        desc(TrustScore.OverallScore)
    ).all()

    result = []
    for rank, (profile, trust) in enumerate(freelancers, 1):
        completed = db.query(Contract).filter(
            Contract.FreelancerID == profile.FreelancerID,
            Contract.Status == "completed",
        ).count()

        # Get earnings from MongoDB
        mongo_db = get_mongo_db()
        earnings_doc = mongo_db.freelancer_earnings.find_one(
            {"freelancer_id": profile.FreelancerID}
        )
        total_earnings = earnings_doc.get("total_earnings", 0.0) if earnings_doc else 0.0

        result.append(FreelancerRankingOut(
            rank=rank,
            freelancer_id=profile.FreelancerID,
            display_name=profile.DisplayName or "Unknown",
            trust_score=trust.OverallScore,
            completed_contracts=completed,
            total_earnings=total_earnings,
            category=profile.Category,
        ))

    return result


# ═══════════════════════════════════════════════════════════════
# JOB ANALYTICS
# ═══════════════════════════════════════════════════════════════

@router.get("/jobs/{job_id}", response_model=JobAnalyticsOut)
def get_job_analytics(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get analytics for a specific job."""
    job = db.query(JobPost).filter(JobPost.JobID == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    total_applications = db.query(Application).filter(
        Application.JobID == job_id
    ).count()

    avg_trust = db.query(func.avg(TrustScore.OverallScore)).join(
        Application, TrustScore.FreelancerID == Application.FreelancerID
    ).filter(Application.JobID == job_id).scalar() or 0.0

    # Get match count from MongoDB
    mongo_db = get_mongo_db()
    match_doc = mongo_db.match_results.find_one({"job_id": job_id})
    top_matches = match_doc.get("total", 0) if match_doc else 0

    return JobAnalyticsOut(
        job_id=job_id,
        title=job.Title,
        total_applications=total_applications,
        avg_trust_score=round(avg_trust, 2),
        top_matches=top_matches,
        status=job.Status,
    )


# ═══════════════════════════════════════════════════════════════
# TRUST SCORE HISTORY
# ═══════════════════════════════════════════════════════════════

@router.get("/trust-score/{freelancer_id}/history")
def get_trust_score_history(
    freelancer_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get trust score history for a freelancer."""
    from app.models import ScoreHistory

    history = db.query(ScoreHistory).filter(
        ScoreHistory.FreelancerID == freelancer_id
    ).order_by(ScoreHistory.ChangedAt.desc()).all()

    return [
        {
            "history_id": h.HistoryID,
            "old_score": h.OldScore,
            "new_score": h.NewScore,
            "change": h.NewScore - h.OldScore,
            "changed_at": h.ChangedAt.isoformat() if h.ChangedAt else None,
            "reason": h.Reason,
        }
        for h in history
    ]


# ═══════════════════════════════════════════════════════════════
# CONTRACT ANALYTICS
# ═══════════════════════════════════════════════════════════════

@router.get("/contracts/summary")
def get_contracts_summary(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get contract summary statistics."""
    total = db.query(Contract).count()
    active = db.query(Contract).filter(Contract.Status == "active").count()
    completed = db.query(Contract).filter(Contract.Status == "completed").count()
    disputed = db.query(Contract).filter(Contract.Status == "disputed").count()

    # Revenue by month
    payments = db.query(
        func.month(PaymentEvent.ProcessedAt).label("month"),
        func.sum(PaymentEvent.Amount).label("revenue")
    ).filter(
        PaymentEvent.EventType == "payment_released"
    ).group_by(
        func.month(PaymentEvent.ProcessedAt)
    ).all()

    return {
        "total_contracts": total,
        "active": active,
        "completed": completed,
        "disputed": disputed,
        "completion_rate": round((completed / max(total, 1)) * 100, 2),
        "revenue_by_month": [
            {"month": p.month, "revenue": p.revenue} for p in payments
        ],
    }