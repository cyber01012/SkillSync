"""Client Analytics router — Real-time personalized analytics for client portal."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from datetime import datetime, timezone

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_client
from app.models import (
    User, FreelancerProfile, ClientProfile, JobPost, Contract,
    Milestone, PaymentEvent, TrustScore, Application
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/client/summary")
def get_client_analytics_summary(
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Get personalized analytics summary for the logged-in client."""
    client_id = current_user.UserID

    # Jobs
    total_jobs = db.query(JobPost).filter(JobPost.ClientID == client_id).count()
    active_jobs = db.query(JobPost).filter(
        JobPost.ClientID == client_id, JobPost.Status == "open"
    ).count()
    closed_jobs = db.query(JobPost).filter(
        JobPost.ClientID == client_id, JobPost.Status == "closed"
    ).count()

    # Applications
    total_applications = db.query(Application).join(
        JobPost, Application.JobID == JobPost.JobID
    ).filter(JobPost.ClientID == client_id).count()

    pending_apps = db.query(Application).join(
        JobPost, Application.JobID == JobPost.JobID
    ).filter(
        JobPost.ClientID == client_id,
        Application.Status == "pending"
    ).count()

    accepted_apps = db.query(Application).join(
        JobPost, Application.JobID == JobPost.JobID
    ).filter(
        JobPost.ClientID == client_id,
        Application.Status == "accepted"
    ).count()

    rejected_apps = db.query(Application).join(
        JobPost, Application.JobID == JobPost.JobID
    ).filter(
        JobPost.ClientID == client_id,
        Application.Status == "rejected"
    ).count()

    # Contracts
    total_contracts = db.query(Contract).filter(Contract.ClientID == client_id).count()
    active_contracts = db.query(Contract).filter(
        Contract.ClientID == client_id, Contract.Status == "active"
    ).count()
    completed_contracts = db.query(Contract).filter(
        Contract.ClientID == client_id, Contract.Status == "completed"
    ).count()
    disputed_contracts = db.query(Contract).filter(
        Contract.ClientID == client_id, Contract.Status == "disputed"
    ).count()

    # Spending — using subquery for SQL Server compatibility
    client_contract_subquery = db.query(Contract.ContractID).filter(
        Contract.ClientID == client_id
    ).subquery()

    total_spent = db.query(func.sum(PaymentEvent.Amount)).filter(
        PaymentEvent.EventType == "payment_released",
        PaymentEvent.ContractID.in_(client_contract_subquery)
    ).scalar() or 0.0

    total_escrow = db.query(func.sum(PaymentEvent.Amount)).filter(
        PaymentEvent.EventType == "escrow_deposit",
        PaymentEvent.ContractID.in_(client_contract_subquery)
    ).scalar() or 0.0

    released_amount = db.query(func.sum(PaymentEvent.Amount)).filter(
        PaymentEvent.EventType == "payment_released",
        PaymentEvent.ContractID.in_(client_contract_subquery)
    ).scalar() or 0.0

    # AI Match Scores from MongoDB
    mongo_db = get_mongo_db()
    client_jobs = db.query(JobPost).filter(JobPost.ClientID == client_id).all()

    match_scores = []
    for job in client_jobs:
        match_doc = mongo_db.match_results.find_one({"job_id": job.JobID})
        if match_doc and match_doc.get("matches"):
            scores = [m["match_score"] for m in match_doc["matches"]]
            if scores:
                match_scores.append(sum(scores) / len(scores))

    avg_match_score = round(sum(match_scores) / len(match_scores), 1) if match_scores else 0.0
    completion_rate = round((completed_contracts / max(total_contracts, 1)) * 100, 1)

    return {
        "client_id": client_id,
        "jobs": {"total": total_jobs, "active": active_jobs, "closed": closed_jobs},
        "applications": {"total": total_applications, "pending": pending_apps, "accepted": accepted_apps, "rejected": rejected_apps},
        "contracts": {"total": total_contracts, "active": active_contracts, "completed": completed_contracts, "disputed": disputed_contracts, "completion_rate": completion_rate},
        "spending": {"total_spent": round(total_spent, 2), "escrow_balance": round(total_escrow - released_amount, 2), "released": round(released_amount, 2)},
        "ai_matches": {"avg_match_score": avg_match_score, "total_jobs_with_matches": len(match_scores)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/client/jobs-performance")
def get_client_jobs_performance(
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    client_id = current_user.UserID
    mongo_db = get_mongo_db()

    jobs = db.query(JobPost).filter(
        JobPost.ClientID == client_id
    ).order_by(desc(JobPost.CreatedAt)).all()

    result = []
    for job in jobs:
        total_apps = db.query(Application).filter(
            Application.JobID == job.JobID
        ).count()

        pending = db.query(Application).filter(
            Application.JobID == job.JobID,
            Application.Status == "pending"
        ).count()

        accepted = db.query(Application).filter(
            Application.JobID == job.JobID,
            Application.Status == "accepted"
        ).count()

        match_doc = mongo_db.match_results.find_one({"job_id": job.JobID})
        match_count = match_doc.get("total", 0) if match_doc else 0
        top_match_score = 0
        if match_doc and match_doc.get("matches"):
            top_match_score = match_doc["matches"][0].get("match_score", 0)

        contract = db.query(Contract).filter(Contract.JobID == job.JobID).first()
        brief = mongo_db.task_briefs.find_one({"job_id": job.JobID})
        budget = brief.get("budget_range", {}) if brief else {}

        result.append({
            "job_id": job.JobID,
            "title": job.Title,
            "status": job.Status,
            "required_trust_score": job.RequiredTrustScore,
            "min_skill_level": job.MinSkillLevel,
            "created_at": job.CreatedAt.isoformat() if job.CreatedAt else None,
            "applications": {"total": total_apps, "pending": pending, "accepted": accepted},
            "matches": {"total": match_count, "top_score": round(top_match_score, 1)},
            "contract_status": contract.Status if contract else None,
            "budget": budget,
        })
    return result


@router.get("/client/spending-breakdown")
def get_client_spending_breakdown(
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    client_id = current_user.UserID

    contracts = db.query(Contract).filter(
        Contract.ClientID == client_id
    ).all()

    spending_by_contract = []
    for contract in contracts:
        job = db.query(JobPost).filter(JobPost.JobID == contract.JobID).first()

        total_paid = db.query(func.sum(PaymentEvent.Amount)).filter(
            PaymentEvent.ContractID == contract.ContractID,
            PaymentEvent.EventType == "payment_released"
        ).scalar() or 0.0

        total_escrow = db.query(func.sum(PaymentEvent.Amount)).filter(
            PaymentEvent.ContractID == contract.ContractID,
            PaymentEvent.EventType == "escrow_deposit"
        ).scalar() or 0.0

        milestones = db.query(Milestone).filter(
            Milestone.ContractID == contract.ContractID
        ).all()

        milestone_data = []
        for m in milestones:
            milestone_data.append({
                "milestone_id": m.MilestoneID,
                "title": m.Title,
                "amount": m.Amount,
                "status": m.Status,
                "approved_at": m.ApprovedAt.isoformat() if m.ApprovedAt else None,
            })

        spending_by_contract.append({
            "contract_id": contract.ContractID,
            "job_title": job.Title if job else "Unknown",
            "freelancer_id": contract.FreelancerID,
            "status": contract.Status,
            "total_amount": contract.TotalAmount,
            "total_paid": round(total_paid, 2),
            "remaining_escrow": round(total_escrow - total_paid, 2),
            "milestones": milestone_data,
        })

    # Monthly spending — SQL Server compatible using raw SQL with DATEPART
    monthly_query = text("""
        SELECT 
            CAST(DATEPART(month, ProcessedAt) AS INT) as month,
            CAST(DATEPART(year, ProcessedAt) AS INT) as year,
            SUM(Amount) as amount
        FROM PaymentEvents
        WHERE EventType = 'payment_released'
        AND ContractID IN (
            SELECT ContractID FROM Contracts WHERE ClientID = :client_id
        )
        GROUP BY DATEPART(year, ProcessedAt), DATEPART(month, ProcessedAt)
        ORDER BY year DESC, month DESC
    """)

    monthly_result = db.execute(monthly_query, {"client_id": client_id}).fetchall()

    return {
        "contracts": spending_by_contract,
        "monthly_summary": [
            {"month": f"{int(m.year)}-{str(int(m.month)).zfill(2)}", "amount": round(float(m.amount), 2)}
            for m in monthly_result
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/client/top-freelancers")
def get_client_top_freelancers(
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    client_id = current_user.UserID

    contracted_freelancers = db.query(
        FreelancerProfile, TrustScore, Contract
    ).join(
        TrustScore, FreelancerProfile.FreelancerID == TrustScore.FreelancerID
    ).join(
        Contract, FreelancerProfile.FreelancerID == Contract.FreelancerID
    ).filter(
        Contract.ClientID == client_id
    ).all()

    result = []
    seen = set()
    for profile, trust, contract in contracted_freelancers:
        if profile.FreelancerID in seen:
            continue
        seen.add(profile.FreelancerID)

        completed = db.query(Contract).filter(
            Contract.FreelancerID == profile.FreelancerID,
            Contract.ClientID == client_id,
            Contract.Status == "completed"
        ).count()

        result.append({
            "freelancer_id": profile.FreelancerID,
            "display_name": profile.DisplayName or "Unknown",
            "headline": profile.Headline,
            "category": profile.Category,
            "trust_score": trust.OverallScore,
            "contracts_count": 1,
            "completed_count": completed,
            "has_baseline_dna": profile.HasBaselineDNA,
        })

    result.sort(key=lambda x: x["trust_score"], reverse=True)
    return result[:10]