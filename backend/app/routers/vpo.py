"""Virtual Project Office router — Kanban, Chat, Submissions, Files."""
import json
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, get_mongo_db
from app.dependencies import get_current_user
from app.models import Contract, FreelancerProfile, User

router = APIRouter(prefix="/api/vpo", tags=["VPO"])


def _get_vpo_workspace(contract_id: int, mongo_db):
    """Get or create VPO workspace for a contract."""
    workspace = mongo_db.vpo_workspaces.find_one({"contract_id": contract_id})
    if not workspace:
        workspace = {
            "contract_id": contract_id,
            "tasks": [],
            "messages": [],
            "submissions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        mongo_db.vpo_workspaces.insert_one(workspace)
    return workspace


# ═══════════════════════════════════════════════════════════════
# KANBAN BOARD — TASKS
# ═══════════════════════════════════════════════════════════════

@router.post("/{contract_id}/tasks")
def create_task(
    contract_id: int,
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a task in the VPO Kanban board."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)

    task = {
        "task_id": f"task_{contract_id}_{len(workspace.get('tasks', [])) + 1}",
        "contract_id": contract_id,
        "title": data.get("title", "New Task"),
        "description": data.get("description", ""),
        "status": data.get("status", "todo"),
        "assignee_id": data.get("assignee_id"),
        "created_by": current_user.UserID,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "due_date": data.get("due_date"),
    }

    mongo_db.vpo_workspaces.update_one(
        {"contract_id": contract_id},
        {"$push": {"tasks": task}}
    )
    return task


@router.get("/{contract_id}/tasks")
def get_tasks(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all tasks for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)
    return workspace.get("tasks", [])


@router.put("/{contract_id}/tasks/{task_id}")
def update_task(
    contract_id: int,
    task_id: str,
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update task status or details."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    update_fields = {}
    if "status" in data:
        update_fields["tasks.$.status"] = data["status"]
    if "title" in data:
        update_fields["tasks.$.title"] = data["title"]
    if "description" in data:
        update_fields["tasks.$.description"] = data["description"]
    if "assignee_id" in data:
        update_fields["tasks.$.assignee_id"] = data["assignee_id"]

    mongo_db.vpo_workspaces.update_one(
        {"contract_id": contract_id, "tasks.task_id": task_id},
        {"$set": update_fields}
    )

    workspace = _get_vpo_workspace(contract_id, mongo_db)
    for task in workspace.get("tasks", []):
        if task["task_id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")


# ═══════════════════════════════════════════════════════════════
# CHAT SYSTEM
# ═══════════════════════════════════════════════════════════════

@router.post("/{contract_id}/messages")
def send_message(
    contract_id: int,
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message in the VPO chat."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)

    sender = db.query(User).filter(User.UserID == current_user.UserID).first()

    message = {
        "msg_id": f"msg_{contract_id}_{len(workspace.get('messages', [])) + 1}",
        "contract_id": contract_id,
        "sender_id": current_user.UserID,
        "sender_name": sender.Username if sender else "Unknown",
        "sender_role": current_user.Role,
        "body": data.get("body", ""),
        "attachments": data.get("attachments", []),
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "read_by": [current_user.UserID],
    }

    mongo_db.vpo_workspaces.update_one(
        {"contract_id": contract_id},
        {"$push": {"messages": message}}
    )

    # Also store in messages collection for global search
    mongo_db.messages.insert_one({
        "msg_id": message["msg_id"],
        "project_id": contract_id,
        "sender_id": current_user.UserID,
        "body": message["body"],
        "attachments": message["attachments"],
        "sent_at": message["sent_at"],
        "read_by": message["read_by"],
    })

    return message


@router.get("/{contract_id}/messages")
def get_messages(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)
    messages = workspace.get("messages", [])

    # Mark messages as read
    mongo_db.vpo_workspaces.update_one(
        {"contract_id": contract_id},
        {"$addToSet": {"messages.$[msg].read_by": current_user.UserID}},
        array_filters=[{"msg.read_by": {"$ne": current_user.UserID}}]
    )

    return messages


# ═══════════════════════════════════════════════════════════════
# FILE SUBMISSIONS + VERSIONING
# ═══════════════════════════════════════════════════════════════

@router.post("/{contract_id}/submissions")
def create_submission(
    contract_id: int,
    data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Freelancer submits work for review."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID != contract.FreelancerID:
        raise HTTPException(status_code=403, detail="Only freelancer can submit")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)

    # Calculate version number
    existing_submissions = workspace.get("submissions", [])
    version = len(existing_submissions) + 1

    submission = {
        "submission_id": f"sub_{contract_id}_{version}",
        "contract_id": contract_id,
        "milestone_id": data.get("milestone_id"),
        "freelancer_id": current_user.UserID,
        "version": version,
        "files": data.get("files", []),
        "text_content": data.get("text_content", ""),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "ai_score": None,
        "fraud_flags": [],
        "status": "pending_review",
    }

    mongo_db.vpo_workspaces.update_one(
        {"contract_id": contract_id},
        {"$push": {"submissions": submission}}
    )

    # Store in submissions collection for global access
    mongo_db.submissions.insert_one(submission)

    # Trigger Fraud Detection Agent
    try:
        from app.agents.fraud_agent import fraud_detection_task
        fraud_detection_task.delay(submission["submission_id"], contract_id)
    except Exception:
        pass

    return submission


@router.get("/{contract_id}/submissions")
def get_submissions(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all submissions for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)
    return workspace.get("submissions", [])


@router.get("/{contract_id}/submissions/{submission_id}")
def get_submission_detail(
    contract_id: int,
    submission_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single submission with fraud analysis."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    submission = mongo_db.submissions.find_one({"submission_id": submission_id})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Get fraud flags
    fraud_flags = list(mongo_db.fraud_logs.find(
        {"submission_id": submission_id},
        {"_id": 0}
    ))

    submission["fraud_flags"] = fraud_flags
    return submission


# ═══════════════════════════════════════════════════════════════
# VPO DASHBOARD / OVERVIEW
# ═══════════════════════════════════════════════════════════════

@router.get("/{contract_id}/dashboard")
def get_vpo_dashboard(
    contract_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get VPO dashboard overview for a contract."""
    contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if current_user.UserID not in [contract.ClientID, contract.FreelancerID]:
        raise HTTPException(status_code=403, detail="Not authorized")

    mongo_db = get_mongo_db()
    workspace = _get_vpo_workspace(contract_id, mongo_db)

    tasks = workspace.get("tasks", [])
    messages = workspace.get("messages", [])
    submissions = workspace.get("submissions", [])

    # Calculate stats
    task_stats = {
        "total": len(tasks),
        "todo": len([t for t in tasks if t.get("status") == "todo"]),
        "in_progress": len([t for t in tasks if t.get("status") == "in_progress"]),
        "done": len([t for t in tasks if t.get("status") == "done"]),
    }

    unread_messages = len([
        m for m in messages
        if current_user.UserID not in m.get("read_by", [])
    ])

    latest_submission = submissions[-1] if submissions else None

    return {
        "contract_id": contract_id,
        "task_stats": task_stats,
        "total_messages": len(messages),
        "unread_messages": unread_messages,
        "total_submissions": len(submissions),
        "latest_submission": latest_submission,
        "recent_tasks": tasks[-5:] if tasks else [],
        "recent_messages": messages[-10:] if messages else [],
    }