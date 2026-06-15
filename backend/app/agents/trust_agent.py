"""Trust Score Agent — Recalculates trust score on project completion.
Triggered when all milestones are approved (contract completed).
Uses: Project completion, milestone ratings, payment history."""
from datetime import datetime, timezone

from app.celery_app import celery_app
from app.core.database import SessionLocal, get_mongo_client
from app.core.config import get_settings
from app.models import FreelancerProfile, TrustScore, ScoreHistory, Contract, Milestone, PaymentEvent

@celery_app.task(bind=True, max_retries=3)
def trust_score_update_task(self, freelancer_id: int, contract_id: int):
    """Update trust score after contract completion."""
    db = SessionLocal()
    try:
        settings = get_settings()
        client = get_mongo_client()
        mongo_db = client[settings.mongodb_db]

        # Get freelancer profile
        freelancer = db.query(FreelancerProfile).filter(
            FreelancerProfile.FreelancerID == freelancer_id
        ).first()
        if not freelancer:
            return {"status": "error", "message": "Freelancer not found"}

        # Get current trust score
        trust = db.query(TrustScore).filter(
            TrustScore.FreelancerID == freelancer_id
        ).first()
        if not trust:
            return {"status": "error", "message": "Trust score not found"}

        old_score = trust.OverallScore

        # Calculate new score based on:
        # 1. Contract completion (+10)
        # 2. On-time delivery (+5)
        # 3. Payment history (+5)
        # 4. Milestone quality (+5)
        # 5. Client feedback (if available)

        new_score = old_score + 10  # Base completion bonus

        # Check if all milestones were approved on time
        contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
        if contract:
            milestones = db.query(Milestone).filter(
                Milestone.ContractID == contract_id
            ).all()

            on_time_count = 0
            for ms in milestones:
                if ms.Status == "approved" and ms.ApprovedAt:
                    if ms.DueDate and ms.ApprovedAt <= ms.DueDate:
                        on_time_count += 1

            if milestones and on_time_count == len(milestones):
                new_score += 5  # On-time bonus

        # Check payment reliability
        payments = db.query(PaymentEvent).filter(
            PaymentEvent.ContractID == contract_id,
            PaymentEvent.EventType == "payment_released"
        ).all()
        if payments:
            new_score += 5  # Payment reliability bonus

        # Cap at 100
        new_score = min(100, new_score)

        # Record history
        history = ScoreHistory(
            FreelancerID=freelancer_id,
            OldScore=old_score,
            NewScore=new_score,
            Reason=f"Contract {contract_id} completed successfully"
        )
        db.add(history)

        # Update trust score
        trust.OverallScore = new_score
        trust.LastCalculatedAt = datetime.now(timezone.utc)
        db.commit()

        # Update freelancer availability
        freelancer.AvailabilityStatus = "available"
        db.commit()

        # Store in MongoDB for analytics
        mongo_db.trust_score_updates.insert_one({
            "freelancer_id": freelancer_id,
            "contract_id": contract_id,
            "old_score": old_score,
            "new_score": new_score,
            "change": new_score - old_score,
            "reason": "Contract completed",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

        print(f"[TRUST AGENT] Freelancer {freelancer_id}: {old_score:.1f} -> {new_score:.1f} (Contract {contract_id})")

        return {
            "status": "success",
            "freelancer_id": freelancer_id,
            "contract_id": contract_id,
            "old_score": old_score,
            "new_score": new_score,
            "change": new_score - old_score,
        }

    except Exception as e:
        print(f"[TRUST AGENT] Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()