"""Skill DNA Agent — Pure logic, no AI."""
import json
from datetime import datetime

from app.celery_app import celery_app
from app.core.database import SessionLocal, get_mongo_client
from app.core.config import get_settings
from app.models import SkillScore, DNASnapshot, FreelancerProfile, Category, ChallengeResult


TRAIT_LABELS = {
    "technical": "Technical Accuracy",
    "creativity": "Creativity",
    "reliability": "Reliability",
    "performance": "Performance",
    "speed": "Speed",
    "deadline": "Deadline",
}


def _calculate_dna(session: dict, category: Category) -> dict:
    dna_profile = json.loads(category.DNAProfileJSON)
    traits = dna_profile.get("traits", [])
    weights_list = dna_profile.get("weights", [])
    weight_map = {traits[i]: weights_list[i] for i in range(min(len(traits), len(weights_list)))}

    test_results = session.get("test_results", {})
    tests_passed = test_results.get("passed", 0)
    tests_total = max(test_results.get("total", 1), 1)

    ai_score = session.get("ai_score", {})
    duration_ms = session.get("duration_ms", 1)
    time_limit_min = session.get("time_limit_minutes", 45)
    on_time = session.get("on_time", True)
    overtime_min = session.get("overtime_minutes", 0)

    raw = {
        "reliability": (tests_passed / tests_total) * 100,
        "technical": ai_score.get("technical", 50),
        "speed": min(100, (time_limit_min * 60000 / max(duration_ms, 1)) * 100),
        "performance": ai_score.get("performance", 50),
        "creativity": ai_score.get("creativity", 50),
        "deadline": 100 if on_time else max(0, 100 - (overtime_min * 2)),
    }

    weighted = {k: round(raw[k] * weight_map.get(k, 0), 2) for k in raw}
    overall = round(sum(weighted.values()), 2)

    return {"raw": raw, "weighted": weighted, "overall": overall, "weight_map": weight_map}


def _store_dna(freelancer_id: int, category_id: int, dna_result: dict, session_id: str, challenge_id: str, duration_ms: int):
    db = SessionLocal()
    try:
        db.query(SkillScore).filter(SkillScore.FreelancerID == freelancer_id).delete()

        for trait_key, label in TRAIT_LABELS.items():
            db.add(SkillScore(
                FreelancerID=freelancer_id,
                TraitName=label,
                Score=int(round(dna_result["raw"].get(trait_key, 50))),
            ))

        snapshot_data = json.dumps({
            "session_id": session_id,
            "challenge_id": challenge_id,
            "raw": dna_result["raw"],
            "weighted": dna_result["weighted"],
            "overall": dna_result["overall"],
            "category_id": category_id,
        })
        db.add(DNASnapshot(
            FreelancerID=freelancer_id,
            SnapshotData=snapshot_data,
        ))

        profile = db.query(FreelancerProfile).filter(
            FreelancerProfile.FreelancerID == freelancer_id
        ).first()
        if profile:
            profile.HasBaselineDNA = True

        overall_int = int(round(dna_result["overall"]))
        existing_result = db.query(ChallengeResult).filter(
            ChallengeResult.FreelancerID == freelancer_id,
            ChallengeResult.ChallengeID == challenge_id,
        ).first()
        if not existing_result:
            db.add(ChallengeResult(
                FreelancerID=freelancer_id,
                ChallengeID=challenge_id,
                Score=overall_int,
                TimeTaken=duration_ms // 1000,
            ))

        db.commit()
        return dna_result
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def run_skill_dna_sync(session_id: str):
    settings = get_settings()
    client = get_mongo_client()
    db_mongo = client[settings.mongodb_db]

    session = db_mongo.work_sessions.find_one({"session_id": session_id})
    if not session:
        return {"status": "error", "message": "Session not found"}

    freelancer_id = session["freelancer_id"]
    db = SessionLocal()
    try:
        profile = db.query(FreelancerProfile).filter(
            FreelancerProfile.FreelancerID == freelancer_id
        ).first()
        if not profile or not profile.CategoryID:
            return {"status": "error", "message": "No category selected"}

        category = db.query(Category).filter(Category.CategoryID == profile.CategoryID).first()
        if not category:
            return {"status": "error", "message": "Category not found"}

        dna_result = _calculate_dna(session, category)
        db.close()

        _store_dna(
            freelancer_id,
            profile.CategoryID,
            dna_result,
            session_id,
            session.get("challenge_id", ""),
            session.get("duration_ms", 0),
        )

        raw_display = {TRAIT_LABELS[k].split()[0] if k != "technical" else "Technical": v
                       for k, v in dna_result["raw"].items()}
        weighted_display = {TRAIT_LABELS[k].split()[0] if k != "technical" else "Technical": v
                            for k, v in dna_result["weighted"].items()}

        print(f"[DNA AGENT] Session: {session_id}")
        print(f"[DNA AGENT] Freelancer: {freelancer_id}")
        print(f"[DNA AGENT] Category: {category.Specialty}")
        print(f"[DNA AGENT] Raw: {raw_display}")
        print(f"[DNA AGENT] Weighted: {weighted_display}")
        print(f"[DNA AGENT] Overall DNA: {dna_result['overall']}")
        print("[DNA AGENT] Stored in SQL Server ✓")

        db_mongo.work_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"dna_calculated": True, "overall_dna": dna_result["overall"]}},
        )

        return {"status": "success", "overall": dna_result["overall"]}
    finally:
        try:
            db.close()
        except Exception:
            pass


@celery_app.task(bind=True, max_retries=3)
def skill_dna_agent_task(self, session_id: str):
    return run_skill_dna_sync(session_id)
