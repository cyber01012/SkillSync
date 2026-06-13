"""Skill DNA endpoints for freelancer dashboard."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies import get_current_freelancer
from app.models import SkillScore, DNASnapshot, TrustScore
from app.schemas import SkillScoreOut, DNASnapshotOut, TrustScoreOut

router = APIRouter(prefix="/api/dna", tags=["Skill DNA"])


@router.get("/scores", response_model=List[SkillScoreOut])
def get_my_dna(current_user = Depends(get_current_freelancer), db: Session = Depends(get_db)):
    """Get current freelancer's 6 Skill DNA trait scores."""
    scores = db.query(SkillScore).filter(
        SkillScore.FreelancerID == current_user.UserID
    ).all()
    return scores


@router.get("/trust-score", response_model=TrustScoreOut)
def get_my_trust_score(current_user = Depends(get_current_freelancer), db: Session = Depends(get_db)):
    """Get current freelancer's Trust Score."""
    trust = db.query(TrustScore).filter(
        TrustScore.FreelancerID == current_user.UserID
    ).first()
    return trust


@router.get("/snapshots", response_model=List[DNASnapshotOut])
def get_dna_history(current_user = Depends(get_current_freelancer), db: Session = Depends(get_db)):
    """Get DNA snapshot history for timeline view."""
    snapshots = db.query(DNASnapshot).filter(
        DNASnapshot.FreelancerID == current_user.UserID
    ).order_by(DNASnapshot.TakenAt.desc()).all()
    return snapshots