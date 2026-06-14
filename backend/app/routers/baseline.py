"""Baseline challenge endpoints — full rebuild."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, get_mongo_db
from app.core.sandbox import run_code_in_sandbox
from app.dependencies import get_current_freelancer
from app.models import FreelancerProfile, Category, ChallengeResult
from app.schemas import (
    BaselineChallengeOut,
    BaselineStartRequest,
    BaselineStartResponse,
    BaselineStepRequest,
    BaselineRunRequest,
    BaselineRunResponse,
    BaselineSubmitRequest,
    BaselineSubmitResponse,
    ChallengeResultOut,
)

router = APIRouter(prefix="/api/baseline", tags=["Baseline Challenge"])

DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced", "expert"]


def _get_freelancer_category(current_user, db: Session):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile or not profile.CategoryID:
        raise HTTPException(status_code=400, detail="Please select a category first")
    category = db.query(Category).filter(Category.CategoryID == profile.CategoryID).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    return profile, category


@router.get("/challenge", response_model=BaselineChallengeOut)
def get_next_challenge(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
    mongo_db=Depends(get_mongo_db),
):
    profile, category = _get_freelancer_category(current_user, db)

    completed_ids = {
        r.ChallengeID for r in db.query(ChallengeResult).filter(
            ChallengeResult.FreelancerID == current_user.UserID
        ).all()
    }

    challenges = list(mongo_db.baseline_challenges.find(
        {"category": category.Specialty},
        {"_id": 0},
    ))

    if not challenges:
        raise HTTPException(status_code=404, detail="No challenges found for your category")

    challenges.sort(key=lambda c: DIFFICULTY_ORDER.index(c.get("difficulty", "beginner")))

    for ch in challenges:
        if ch["challenge_id"] not in completed_ids:
            return BaselineChallengeOut(
                challenge_id=ch["challenge_id"],
                title=ch["title"],
                description=ch["description"],
                time_limit_minutes=ch.get("time_limit_minutes", 45),
                starter_code=ch.get("starter_code", ""),
                test_cases=ch.get("test_cases", []),
                language=ch.get("language", "python"),
                difficulty=ch.get("difficulty", "beginner"),
                category=category.Specialty,
                all_completed=False,
            )

    first = challenges[0]
    return BaselineChallengeOut(
        challenge_id=first["challenge_id"],
        title=first["title"],
        description=first["description"],
        time_limit_minutes=first.get("time_limit_minutes", 45),
        starter_code=first.get("starter_code", ""),
        test_cases=first.get("test_cases", []),
        language=first.get("language", "python"),
        difficulty=first.get("difficulty", "beginner"),
        category=category.Specialty,
        all_completed=True,
    )


@router.post("/start", response_model=BaselineStartResponse)
def start_challenge(
    data: BaselineStartRequest,
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
    mongo_db=Depends(get_mongo_db),
):
    profile, category = _get_freelancer_category(current_user, db)

    challenge = mongo_db.baseline_challenges.find_one(
        {"challenge_id": data.challenge_id, "category": category.Specialty},
        {"_id": 0},
    )
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    session_id = f"ws-{uuid.uuid4().hex[:12]}"
    started_at = datetime.utcnow().isoformat()

    mongo_db.work_sessions.insert_one({
        "session_id": session_id,
        "freelancer_id": current_user.UserID,
        "challenge_id": data.challenge_id,
        "category": category.Specialty,
        "category_id": profile.CategoryID,
        "started_at": started_at,
        "status": "active",
        "steps": [],
        "files": {"main.py": challenge.get("starter_code", "")},
        "time_limit_minutes": challenge.get("time_limit_minutes", 45),
        "ai_prompt_template": challenge.get("ai_prompt_template", ""),
        "test_cases": challenge.get("test_cases", []),
        "language": challenge.get("language", "python"),
        "type": "baseline",
    })

    return BaselineStartResponse(
        session_id=session_id,
        challenge_id=data.challenge_id,
        started_at=started_at,
    )


@router.post("/step")
def record_step(
    data: BaselineStepRequest,
    current_user=Depends(get_current_freelancer),
    mongo_db=Depends(get_mongo_db),
):
    session = mongo_db.work_sessions.find_one({"session_id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["freelancer_id"] != current_user.UserID:
        raise HTTPException(status_code=403, detail="Not your session")

    step = {
        "timestamp": data.timestamp,
        "action": data.action,
        "content": data.content,
        "file": data.file,
        "cursor_line": data.cursor_line,
        "cursor_col": data.cursor_col,
    }

    update = {"$push": {"steps": step}}
    if data.action == "code_write" and data.content:
        update["$set"] = {f"files.{data.file}": data.content}

    mongo_db.work_sessions.update_one({"session_id": data.session_id}, update)
    return {"message": "Step recorded"}


@router.post("/run", response_model=BaselineRunResponse)
def run_tests(
    data: BaselineRunRequest,
    current_user=Depends(get_current_freelancer),
    mongo_db=Depends(get_mongo_db),
):
    session = mongo_db.work_sessions.find_one({"session_id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["freelancer_id"] != current_user.UserID:
        raise HTTPException(status_code=403, detail="Not your session")

    test_cases = session.get("test_cases", [])
    language = session.get("language", "python")

    result = run_code_in_sandbox(data.code, test_cases, language)

    mongo_db.work_sessions.update_one(
        {"session_id": data.session_id},
        {
            "$set": {"test_results": result, f"files.{data.file}": data.code},
            "$push": {"steps": {
                "timestamp": datetime.utcnow().isoformat(),
                "action": "test_run",
                "content": f"passed={result['passed']}/{result['total']}",
                "file": data.file,
            }},
        },
    )

    return BaselineRunResponse(**result)


@router.post("/submit", response_model=BaselineSubmitResponse)
def submit_challenge(
    data: BaselineSubmitRequest,
    current_user=Depends(get_current_freelancer),
    mongo_db=Depends(get_mongo_db),
):
    session = mongo_db.work_sessions.find_one({"session_id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["freelancer_id"] != current_user.UserID:
        raise HTTPException(status_code=403, detail="Not your session")

    test_cases = session.get("test_cases", [])
    language = session.get("language", "python")
    test_results = run_code_in_sandbox(data.code, test_cases, language)

    completed_at = datetime.utcnow().isoformat()
    mongo_db.work_sessions.update_one(
        {"session_id": data.session_id},
        {"$set": {
            "status": "submitted",
            "submitted_at": completed_at,
            "completed_at": completed_at,
            "duration_ms": data.duration_ms,
            "on_time": data.on_time,
            "overtime_minutes": data.overtime_minutes,
            "test_results": test_results,
            "files.main.py": data.code,
            "dna_calculated": False,
        }, "$push": {"steps": {
            "timestamp": completed_at,
            "action": "submit",
            "content": "Final submission",
            "file": "main.py",
        }}},
    )

    prompt_template = session.get("ai_prompt_template", "Rate this code 0-100 on technical, creativity, performance. Return JSON only.")
    code = data.code

    try:
        from app.agents.ai_scorer import ai_scorer_task
        ai_scorer_task.delay(data.session_id, code, prompt_template)
    except Exception:
        from app.agents.ai_scorer import run_ai_scorer_sync
        run_ai_scorer_sync(data.session_id, code, prompt_template)

    return BaselineSubmitResponse(
        session_id=data.session_id,
        status="processing",
        message="Submission received. AI scoring in progress.",
    )


@router.get("/results", response_model=list[ChallengeResultOut])
def get_my_results(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    results = db.query(ChallengeResult).filter(
        ChallengeResult.FreelancerID == current_user.UserID
    ).order_by(ChallengeResult.CompletedAt.desc()).all()
    return results


@router.get("/session/{session_id}/status")
def get_session_status(
    session_id: str,
    current_user=Depends(get_current_freelancer),
    mongo_db=Depends(get_mongo_db),
):
    session = mongo_db.work_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["freelancer_id"] != current_user.UserID:
        raise HTTPException(status_code=403, detail="Not your session")

    return {
        "dna_calculated": session.get("dna_calculated", False),
        "overall_dna": session.get("overall_dna"),
        "ai_score": session.get("ai_score"),
        "status": session.get("status"),
    }
