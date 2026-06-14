"""Matching Agent — Pure SQL logic, no AI.
Triggered when a new job is posted.
Ranks freelancers by: Trust Score + DNA fit + Category match."""
import json
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
                    try:
                        dna_data = json.loads(latest_dna.SnapshotData)
                        overall = dna_data.get("overall", 0)
                        if overall >= 80:
                            score += 5
                    except (json.JSONDecodeError, TypeError):
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
            print(
                f"[MATCHING AGENT] Top match: Freelancer {ranked[0]['freelancer_id']} "
                f"with score {ranked[0]['match_score']:.1f}"
            )
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
