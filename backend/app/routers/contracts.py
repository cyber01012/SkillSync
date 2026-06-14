"""Contracts router — Contract signing, milestones, escrow, payments, disputes."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_user, get_current_client, get_current_freelancer
from app.models import (
    JobPost, Application, ClientProfile, FreelancerProfile,
    TrustScore, User, Contract, Milestone, PaymentEvent, DisputeRecord
)
from app.schemas import (
    ContractCreate, ContractOut, MilestoneCreate, MilestoneOut,
    MilestoneApproveRequest, EscrowStatusOut, PaymentEventOut,
    MessageResponse, DisputeCreate, DisputeOut
)

router = APIRouter(prefix="/api/contracts", tags=["Contracts"])


def _build_contract_out(contract: Contract, db: Session) -> ContractOut:
    job = db.query(JobPost).filter(JobPost.JobID == contract.JobID).first()
    freelancer = db.query(User).filter(User.UserID == contract.FreelancerID).first()
    client = db.query(User).filter(User.UserID == contract.ClientID).first()
    return ContractOut(
        ContractID=contract.ContractID,
        JobID=contract.JobID,
        FreelancerID=contract.FreelancerID,
        ClientID=contract.ClientID,
        TotalAmount=contract.TotalAmount,
        Status=contract.Status,
        CreatedAt=contract.CreatedAt,
        job_title=job.Title if job else None,
        freelancer_name=freelancer.Username if freelancer else None,
        client_name=client.Username if client else None,
    )


# ═══════════════════════════════════════════════════════════════
# CREATE CONTRACT (Client accepts an application)
# ═══════════════════════════════════════════════════════════════

@router.post("", response_model=ContractOut, status_code=status.HTTP_201_CREATED)
def create_contract(
    data: ContractCreate,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client creates a contract by accepting a freelancer's application."""
    job = db.query(JobPost).filter(
        JobPost.JobID == data.job_id,
        JobPost.ClientID == current_user.UserID,
        JobPost.Status == "open",
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not yours")

    application = db.query(Application).filter(
        Application.JobID == data.job_id,
        Application.FreelancerID == data.freelancer_id,
        Application.Status == "accepted",
    ).first()
    if not application:
        raise HTTPException(
            status_code=400,
            detail="Freelancer must be accepted before contract creation",
        )

    existing = db.query(Contract).filter(
        Contract.JobID == data.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contract already exists for this job")

    contract = Contract(
        JobID=data.job_id,
        FreelancerID=data.freelancer_id,
        ClientID=current_user.UserID,
        TotalAmount=data.total_amount,
        Status="active",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Create milestones
    for ms in data.milestones or []:
        milestone = Milestone(
            ContractID=contract.ContractID,
            Title=ms.get("title", "Milestone"),
            Amount=ms.get("amount", 0),
            DueDate=ms.get("due_date"),
            Status="pending",
        )
        db.add(milestone)

    # Initial escrow payment event
    payment = PaymentEvent(
        ContractID=contract.ContractID,
        Amount=data.total_amount,
        EventType="escrow_deposit",
        EscrowBalance=data.total_amount,
    )
    db.add(payment)

    # Update job status
    job.Status = "contracted"
    db.commit()
    db.refresh(contract)

    # Update freelancer availability
    freelancer_profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == data.freelancer_id
    ).first()
    if freelancer_profile:
        freelancer_profile.AvailabilityStatus = "busy"
        db.commit()

    # Create VPO workspace in MongoDB
    mongo_db = get_mongo_db()
    mongo_db.vpo_workspaces.insert_one({
        "contract_id": contract.ContractID,
        "job_id": data.job_id,
        "client_id": current_user.UserID,
        "freelancer_id": data.freelancer_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "tasks": [],
        "messages": [],
        "submissions": [],
    })

    return _build_contract_out(contract, db)


# ═══════════════════════════════════════════════════════════════
# LIST MY CONTRACTS
# ═══════════════════════════════════════════════════════════════

@router.get("/my", response_model=List[ContractOut])
def get_my_contracts(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get contracts for current user (client or freelancer)."""
    if current_user.Role == "client":
        contracts = db.query(Contract).filter(
            Contract.ClientID == current_user.UserID
        ).order_by(Contract.CreatedAt.desc()).all()
    else:
        contracts = db.query(Contract).filter(
            Contract.FreelancerID == current_user.UserID
        ).order_by(Contract.CreatedAt.desc()).all()
    return [_build_contract_out(c, db) for c in contracts]


@router.get("/{contract_id}", response_model=ContractOut)
def get_contract_detail(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single contract detail."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return _build_contract_out(contract, db)


# ═══════════════════════════════════════════════════════════════
# MILESTONES
# ═══════════════════════════════════════════════════════════════

@router.post("/{contract_id}/milestones", response_model=MilestoneOut)
def add_milestone(
    contract_id: int,
    data: MilestoneCreate,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Add a milestone to a contract."""
    contract = db.query(Contract).filter(
        Contract.ContractID == contract_id,
        Contract.ClientID == current_user.UserID,
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found or not yours")

    milestone = Milestone(
        ContractID=contract_id,
        Title=data.title,
        Amount=data.amount,
        DueDate=data.due_date,
        Status="pending",
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.get("/{contract_id}/milestones", response_model=List[MilestoneOut])
def get_milestones(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get milestones for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    milestones = db.query(Milestone).filter(
        Milestone.ContractID == contract_id
    ).order_by(Milestone.MilestoneID).all()
    return milestones


@router.put("/milestones/{milestone_id}/approve", response_model=MilestoneOut)
def approve_milestone(
    milestone_id: int,
    current_user=Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Client approves a milestone — triggers payment release."""
    milestone = db.query(Milestone).filter(
        Milestone.MilestoneID == milestone_id
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = db.query(Contract).filter(
        Contract.ContractID == milestone.ContractID,
        Contract.ClientID == current_user.UserID,
    ).first()
    if not contract:
        raise HTTPException(status_code=403, detail="Not authorized")

    if milestone.Status != "pending":
        raise HTTPException(status_code=400, detail="Milestone already processed")

    # Transaction: update milestone + create payment event + update escrow
    try:
        milestone.Status = "approved"
        milestone.ApprovedAt = datetime.now(timezone.utc)

        # Calculate current escrow
        total_deposited = db.query(PaymentEvent).filter(
            PaymentEvent.ContractID == contract.ContractID,
            PaymentEvent.EventType == "escrow_deposit",
        ).all()
        total_in = sum(p.Amount for p in total_deposited)

        total_released = db.query(PaymentEvent).filter(
            PaymentEvent.ContractID == contract.ContractID,
            PaymentEvent.EventType == "payment_released",
        ).all()
        total_out = sum(p.Amount for p in total_released)

        new_balance = total_in - total_out - milestone.Amount

        payment = PaymentEvent(
            ContractID=contract.ContractID,
            Amount=milestone.Amount,
            EventType="payment_released",
            EscrowBalance=new_balance,
        )
        db.add(payment)
        db.commit()
        db.refresh(milestone)

        # Trigger Payment Release Agent
        try:
            from app.agents.payment_agent import payment_release_task
            payment_release_task.delay(contract.ContractID, milestone.MilestoneID, milestone.Amount)
        except Exception:
            pass

        # Trigger Trust Score Agent on final milestone
        all_milestones = db.query(Milestone).filter(
            Milestone.ContractID == contract.ContractID
        ).all()
        if all(m.Status == "approved" for m in all_milestones):
            contract.Status = "completed"
            db.commit()
            try:
                from app.agents.trust_agent import trust_score_update_task
                trust_score_update_task.delay(contract.FreelancerID, contract.ContractID)
            except Exception:
                pass

        return milestone
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment processing failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# ESCROW STATUS
# ═══════════════════════════════════════════════════════════════

@router.get("/{contract_id}/escrow", response_model=EscrowStatusOut)
def get_escrow_status(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get escrow status for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    total_deposited = db.query(PaymentEvent).filter(
        PaymentEvent.ContractID == contract_id,
        PaymentEvent.EventType == "escrow_deposit",
    ).all()
    total_in = sum(p.Amount for p in total_deposited)

    total_released = db.query(PaymentEvent).filter(
        PaymentEvent.ContractID == contract_id,
        PaymentEvent.EventType == "payment_released",
    ).all()
    total_out = sum(p.Amount for p in total_released)

    milestones = db.query(Milestone).filter(Milestone.ContractID == contract_id).all()
    milestones_total = sum(m.Amount for m in milestones)

    return EscrowStatusOut(
        contract_id=contract_id,
        total_amount=contract.TotalAmount,
        escrow_balance=total_in - total_out,
        milestones_total=milestones_total,
        released_amount=total_out,
        pending_amount=milestones_total - total_out,
    )


# ═══════════════════════════════════════════════════════════════
# PAYMENT HISTORY
# ═══════════════════════════════════════════════════════════════

@router.get("/{contract_id}/payments", response_model=List[PaymentEventOut])
def get_payment_history(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment history for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    payments = db.query(PaymentEvent).filter(
        PaymentEvent.ContractID == contract_id
    ).order_by(PaymentEvent.ProcessedAt.desc()).all()
    return payments


# ═══════════════════════════════════════════════════════════════
# DISPUTES
# ═══════════════════════════════════════════════════════════════

@router.post("/{contract_id}/disputes", response_model=DisputeOut)
def raise_dispute(
    contract_id: int,
    data: DisputeCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Raise a dispute on a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    dispute = DisputeRecord(
        ContractID=contract_id,
        RaisedBy=current_user.UserID,
        Description=data.description,
        Status="open",
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute


@router.get("/{contract_id}/disputes", response_model=List[DisputeOut])
def get_disputes(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get disputes for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    disputes = db.query(DisputeRecord).filter(
        DisputeRecord.ContractID == contract_id
    ).order_by(DisputeRecord.DisputeID.desc()).all()
    return disputes