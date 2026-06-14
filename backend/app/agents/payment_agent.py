"""Payment Release Agent — Auto-releases payments on milestone approval.
Triggered when client approves a milestone."""
from datetime import datetime, timezone

from app.celery_app import celery_app
from app.core.database import SessionLocal, get_mongo_client
from app.core.config import get_settings
from app.models import Contract, Milestone, PaymentEvent, FreelancerProfile


@celery_app.task(bind=True, max_retries=3)
def payment_release_task(self, contract_id: int, milestone_id: int, amount: float):
    """Process payment release for an approved milestone."""
    db = SessionLocal()
    try:
        settings = get_settings()
        client = get_mongo_client()
        mongo_db = client[settings.mongodb_db]

        contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
        if not contract:
            return {"status": "error", "message": "Contract not found"}

        milestone = db.query(Milestone).filter(Milestone.MilestoneID == milestone_id).first()
        if not milestone or milestone.Status != "approved":
            return {"status": "error", "message": "Milestone not approved"}

        # Verify payment hasn't been released yet
        existing = db.query(PaymentEvent).filter(
            PaymentEvent.ContractID == contract_id,
            PaymentEvent.EventType == "payment_released",
        ).all()
        total_released = sum(p.Amount for p in existing)

        if total_released >= contract.TotalAmount:
            return {"status": "error", "message": "Contract fully paid"}

        # Create payment record
        payment = PaymentEvent(
            ContractID=contract_id,
            Amount=amount,
            EventType="payment_released",
            EscrowBalance=contract.TotalAmount - total_released - amount,
        )
        db.add(payment)
        db.commit()

        # Store payment in MongoDB for analytics
        mongo_db.payment_records.insert_one({
            "payment_id": f"pay_{contract_id}_{milestone_id}",
            "contract_id": contract_id,
            "milestone_id": milestone_id,
            "freelancer_id": contract.FreelancerID,
            "client_id": contract.ClientID,
            "amount": amount,
            "status": "released",
            "released_at": datetime.now(timezone.utc).isoformat(),
            "escrow_after": contract.TotalAmount - total_released - amount,
        })

        # Update freelancer earnings
        freelancer = db.query(FreelancerProfile).filter(
            FreelancerProfile.FreelancerID == contract.FreelancerID
        ).first()
        if freelancer:
            # Store earnings in MongoDB
            mongo_db.freelancer_earnings.update_one(
                {"freelancer_id": contract.FreelancerID},
                {
                    "$inc": {"total_earnings": amount, "completed_milestones": 1},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
                },
                upsert=True,
            )

        print(f"[PAYMENT AGENT] Released ${amount:.2f} for contract {contract_id}, milestone {milestone_id}")

        return {
            "status": "success",
            "contract_id": contract_id,
            "milestone_id": milestone_id,
            "amount_released": amount,
            "escrow_remaining": contract.TotalAmount - total_released - amount,
        }

    except Exception as e:
        print(f"[PAYMENT AGENT] Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()