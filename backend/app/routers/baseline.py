"""Baseline skill verification challenge for new freelancers."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_freelancer
from app.models import ChallengeResult, SkillScore, DNASnapshot
from app.schemas import ChallengeSubmit, ChallengeResultOut, BaselineChallenge

router = APIRouter(prefix="/api/baseline", tags=["Baseline Challenge"])


# Pre-defined baseline challenges
BASELINE_CHALLENGES = [
    BaselineChallenge(
        challenge_id=1,
        title="Code Debugging Challenge",
        description="Find and fix 3 bugs in a provided Python function.",
        time_limit_minutes=15,
        instructions="Review the code, identify bugs, and submit your corrected version with comments explaining each fix.",
    ),
    BaselineChallenge(
        challenge_id=2,
        title="Logic Puzzle",
        description="Solve a series of logic puzzles to demonstrate problem-solving ability.",
        time_limit_minutes=10,
        instructions="Answer all questions. Partial credit given for reasoning.",
    ),
]


@router.get("/challenge", response_model=list[BaselineChallenge])
def get_baseline_challenges():
    """Get available baseline challenges for new freelancers."""
    return BASELINE_CHALLENGES


@router.post("/submit", response_model=ChallengeResultOut)
def submit_baseline(
    submission: ChallengeSubmit,
    current_user = Depends(get_current_freelancer),
    db: Session = Depends(get_db),
    mongo_db = Depends(get_mongo_db),
):
    """Submit baseline challenge. Stores session recording in MongoDB, updates Skill DNA."""
    
    # Calculate a simple score based on steps and time
    step_count = len(submission.steps)
    time_bonus = max(0, 900 - submission.duration_ms // 1000)  # 15 min = 900s
    base_score = min(100, 30 + step_count * 5 + time_bonus // 30)
    
    # Store in SQL Server
    result = ChallengeResult(
        FreelancerID=current_user.UserID,
        ChallengeID=submission.challenge_id,
        Score=base_score,
        TimeTaken=submission.duration_ms // 1000,
    )
    db.add(result)
    db.flush()
    
    # Store work session recording in MongoDB (proof-of-work)
    mongo_db.work_sessions.insert_one({
        "session_id": f"baseline_{current_user.UserID}_{submission.challenge_id}",
        "freelancer_id": current_user.UserID,
        "challenge_id": submission.challenge_id,
        "steps": submission.steps,
        "duration_ms": submission.duration_ms,
        "output_text": submission.output_text,
        "submitted_at": datetime.utcnow().isoformat(),
        "type": "baseline",
    })
    
    # Update Skill DNA - slightly boost relevant traits based on performance
    trait_updates = {
        "Technical Accuracy": min(100, 50 + base_score // 10),
        "Reliability": min(100, 50 + 5),
    }
    
    for trait_name, new_score in trait_updates.items():
        skill = db.query(SkillScore).filter(
            SkillScore.FreelancerID == current_user.UserID,
            SkillScore.TraitName == trait_name,
        ).first()
        if skill:
            skill.Score = new_score
    
    # Take DNA Snapshot
    dna_data = db.query(SkillScore).filter(
        SkillScore.FreelancerID == current_user.UserID
    ).all()
    
    snapshot_json = "{" + ", ".join([f'"{s.TraitName}": {s.Score}' for s in dna_data]) + "}"
    
    db.add(DNASnapshot(
        FreelancerID=current_user.UserID,
        SnapshotData=snapshot_json,
    ))
    
    db.commit()
    
    return ChallengeResultOut(
        ResultID=result.ResultID,
        ChallengeID=result.ChallengeID,
        Score=result.Score,
        TimeTaken=result.TimeTaken,
        CompletedAt=result.CompletedAt,
    )


@router.get("/results", response_model=list[ChallengeResultOut])
def get_my_results(current_user = Depends(get_current_freelancer), db: Session = Depends(get_db)):
    """Get current freelancer's challenge results."""
    results = db.query(ChallengeResult).filter(
        ChallengeResult.FreelancerID == current_user.UserID
    ).all()
    return results