"""Skill DNA endpoints for freelancer dashboard."""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies import get_current_freelancer
from app.models import SkillScore, DNASnapshot, TrustScore, FreelancerProfile, ChallengeResult, Category
from app.schemas import SkillScoreOut, DNASnapshotOut, TrustScoreOut, DNAStatusOut, DNAActivityItem

router = APIRouter(prefix="/api/dna", tags=["Skill DNA"])


@router.get("/scores", response_model=List[SkillScoreOut])
def get_my_dna(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    scores = db.query(SkillScore).filter(
        SkillScore.FreelancerID == current_user.UserID
    ).all()
    return scores


@router.get("/trust-score", response_model=TrustScoreOut)
def get_my_trust_score(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    trust = db.query(TrustScore).filter(
        TrustScore.FreelancerID == current_user.UserID
    ).first()
    return trust


@router.get("/snapshots", response_model=List[DNASnapshotOut])
def get_dna_history(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    snapshots = db.query(DNASnapshot).filter(
        DNASnapshot.FreelancerID == current_user.UserID
    ).order_by(DNASnapshot.TakenAt.asc()).all()
    return snapshots


@router.get("/status", response_model=DNAStatusOut)
def get_dna_status(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()

    overall = None
    latest = db.query(DNASnapshot).filter(
        DNASnapshot.FreelancerID == current_user.UserID
    ).order_by(DNASnapshot.TakenAt.desc()).first()
    if latest:
        try:
            data = json.loads(latest.SnapshotData)
            overall = data.get("overall")
        except (json.JSONDecodeError, TypeError):
            pass

    return DNAStatusOut(
        has_baseline_dna=bool(profile and profile.HasBaselineDNA),
        overall_dna=overall,
    )


@router.get("/activity", response_model=List[DNAActivityItem])
def get_dna_activity(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    items = []

    results = db.query(ChallengeResult).filter(
        ChallengeResult.FreelancerID == current_user.UserID
    ).order_by(ChallengeResult.CompletedAt.desc()).limit(10).all()

    for r in results:
        items.append(DNAActivityItem(
            type="challenge_complete",
            title=f"Completed {r.ChallengeID}",
            description=f"Score: {r.Score}/100 in {r.TimeTaken}s",
            timestamp=r.CompletedAt,
            score_change=float(r.Score),
        ))

    snapshots = db.query(DNASnapshot).filter(
        DNASnapshot.FreelancerID == current_user.UserID
    ).order_by(DNASnapshot.TakenAt.desc()).limit(5).all()

    for s in snapshots:
        try:
            data = json.loads(s.SnapshotData)
            overall = data.get("overall", 0)
        except (json.JSONDecodeError, TypeError):
            overall = None
        items.append(DNAActivityItem(
            type="dna_snapshot",
            title="DNA Snapshot Updated",
            description=f"Overall DNA: {overall}" if overall else "Profile updated",
            timestamp=s.TakenAt,
            score_change=overall,
        ))

    items.sort(key=lambda x: x.timestamp or __import__("datetime").datetime.min, reverse=True)
    return items[:15]


@router.get("/profile-weights")
def get_category_weights(current_user=Depends(get_current_freelancer), db: Session = Depends(get_db)):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile or not profile.CategoryID:
        return {"weights": {}, "labels": {}}

    category = db.query(Category).filter(Category.CategoryID == profile.CategoryID).first()
    if not category:
        return {"weights": {}, "labels": {}}

    try:
        dna = json.loads(category.DNAProfileJSON)
        return {"weights": dict(zip(dna.get("traits", []), dna.get("weights", []))), "labels": dna.get("labels", {})}
    except (json.JSONDecodeError, TypeError):
        return {"weights": {}, "labels": {}}
