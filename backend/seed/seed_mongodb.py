"""MongoDB Seed Script — NoSQL, Indexing, Projection, Data Modeling."""
from pymongo import MongoClient, ASCENDING, TEXT
from datetime import datetime
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import get_settings
from baseline_challenges_data import get_baseline_challenges

settings = get_settings()


def get_client():
    return MongoClient(settings.mongodb_url)


def seed_collections():
    print("\n" + "="*60)
    print("PHASE 1: NoSQL Collections")
    print("="*60)
    
    client = get_client()
    db = client[settings.mongodb_db]
    
    # ── Drop all existing collections ──
    collections = [
        'task_briefs', 'work_sessions', 'submissions',
        'messages', 'rubric_templates', 'behavioral_logs', 'fraud_logs',
        'baseline_challenges',
        # ── MEMBER 3 & 4: New collections ──
        'vpo_workspaces', 'match_results', 'payment_records', 'freelancer_earnings',
    ]
    for col in collections:
        db[col].drop()
        print(f"   ✅ Recreated: {col}")
    
    # ── Task Briefs (Member 2) ──
    db.task_briefs.insert_many([
        {
            "job_id": 1,
            "title": "Build E-Commerce Dashboard",
            "full_description": "We need a full-stack developer to build a React + FastAPI e-commerce dashboard...",
            "required_tools": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"],
            "tags": ["frontend", "backend", "dashboard", "e-commerce"],
            "budget_range": {"min": 2000, "max": 5000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-15T00:00:00Z"
        },
        {
            "job_id": 2,
            "title": "AI Chatbot Integration",
            "full_description": "Integrate Claude API into existing customer support system...",
            "required_tools": ["Python", "OpenAI API", "FastAPI", "Redis"],
            "tags": ["ai", "backend", "api-integration"],
            "budget_range": {"min": 3000, "max": 8000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-08-01T00:00:00Z"
        }
    ])
    
    # ── Work Sessions (Member 1) ──
    db.work_sessions.insert_many([
        {
            "session_id": "baseline_4_1",
            "freelancer_id": 4,
            "challenge_id": 1,
            "steps": [
                {"timestamp": "2026-06-10T10:00:05Z", "action": "read_code", "content": "Reviewed buggy function"},
                {"timestamp": "2026-06-10T10:00:30Z", "action": "identify_bug", "content": "Found null pointer exception"},
                {"timestamp": "2026-06-10T10:01:15Z", "action": "write_fix", "content": "Added null check"},
                {"timestamp": "2026-06-10T10:02:00Z", "action": "test", "content": "Ran unit tests - passed"},
                {"timestamp": "2026-06-10T10:02:45Z", "action": "submit", "content": "Final submission"}
            ],
            "duration_ms": 165000,
            "output_url": None,
            "submitted_at": "2026-06-10T10:02:45Z",
            "type": "baseline"
        }
    ])
    
    # ── Submissions (Member 3) ──
    db.submissions.insert_one({
        "submission_id": "sub_001",
        "contract_id": 1,
        "freelancer_id": 4,
        "version": 1,
        "files": [
            {"filename": "dashboard_v1.zip", "url": "/uploads/dashboard_v1.zip", "size": 2048000}
        ],
        "text_content": "Initial dashboard implementation...",
        "submitted_at": datetime.utcnow().isoformat(),
        "ai_score": 0.15,
        "fraud_flags": [],
        "fraud_status": "cleared",
        "status": "pending_review"
    })
    
    # ── Messages (Member 3) ──
    db.messages.insert_many([
        {
            "msg_id": "msg_001",
            "project_id": 1,
            "sender_id": 2,
            "body": "Hi Ali, thanks for applying. Can you start Monday?",
            "attachments": [],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [4]
        }
    ])
    
    # ── Rubric Templates (Member 1) ──
    db.rubric_templates.insert_one({
        "rubric_id": 1,
        "created_by": 2,
        "criteria": [
            {"name": "Code Quality", "weight": 0.30, "description": "Clean, readable code", "scoring_guide": {"excellent": "90-100"}},
            {"name": "Functionality", "weight": 0.40, "description": "All requirements implemented", "scoring_guide": {"excellent": "90-100"}}
        ],
        "created_at": datetime.utcnow().isoformat()
    })
    
    # ── Behavioral Logs (Member 1) ──
    db.behavioral_logs.insert_many([
        {"log_id": "bl_001", "freelancer_id": 4, "session_id": "baseline_4_1", "event_type": "code_read", "value": 5, "recorded_at": "2026-06-10T10:00:05Z"},
        {"log_id": "bl_002", "freelancer_id": 4, "session_id": "baseline_4_1", "event_type": "bug_fix", "value": 3, "recorded_at": "2026-06-10T10:01:15Z"}
    ])
    
    # ── Fraud Logs (Member 3) ──
    db.fraud_logs.insert_many([
        {
            "log_id": "fl_001",
            "user_id": 99,
            "detection_type": "ai_content",
            "evidence": {"ai_probability": 0.87, "model_detected": "GPT-4"},
            "confidence_score": 0.92,
            "flagged_at": datetime.utcnow().isoformat()
        }
    ])

    # ── Baseline Challenges (Member 1) ──
    challenges = get_baseline_challenges()
    db.baseline_challenges.insert_many(challenges)
    print(f"   ✅ Seeded {len(challenges)} baseline challenges")

    # ── MEMBER 3: VPO Workspaces ──
    db.vpo_workspaces.insert_one({
        "contract_id": 1,
        "job_id": 1,
        "client_id": 2,
        "freelancer_id": 4,
        "created_at": datetime.utcnow().isoformat(),
        "tasks": [
            {
                "task_id": "task_1_1",
                "contract_id": 1,
                "title": "Setup project structure",
                "description": "Initialize React + FastAPI project",
                "status": "done",
                "assignee_id": 4,
                "created_by": 2,
                "created_at": datetime.utcnow().isoformat(),
                "due_date": "2026-06-20T00:00:00Z"
            },
            {
                "task_id": "task_1_2",
                "contract_id": 1,
                "title": "Build authentication module",
                "description": "JWT auth with login/register",
                "status": "in_progress",
                "assignee_id": 4,
                "created_by": 2,
                "created_at": datetime.utcnow().isoformat(),
                "due_date": "2026-06-25T00:00:00Z"
            },
            {
                "task_id": "task_1_3",
                "contract_id": 1,
                "title": "Create dashboard UI",
                "description": "Responsive dashboard with charts",
                "status": "todo",
                "assignee_id": 4,
                "created_by": 2,
                "created_at": datetime.utcnow().isoformat(),
                "due_date": "2026-06-30T00:00:00Z"
            }
        ],
        "messages": [
            {
                "msg_id": "msg_1_1",
                "contract_id": 1,
                "sender_id": 2,
                "sender_name": "client1",
                "sender_role": "client",
                "body": "Welcome to the project! Let's start with the setup.",
                "attachments": [],
                "sent_at": datetime.utcnow().isoformat(),
                "read_by": [2, 4]
            }
        ],
        "submissions": [
            {
                "submission_id": "sub_1_1",
                "contract_id": 1,
                "milestone_id": 1,
                "freelancer_id": 4,
                "version": 1,
                "files": [
                    {"filename": "project_setup.zip", "url": "/uploads/project_setup.zip", "size": 1024000}
                ],
                "text_content": "Project structure initialized with React and FastAPI",
                "submitted_at": datetime.utcnow().isoformat(),
                "ai_score": 0.05,
                "fraud_flags": [],
                "status": "pending_review"
            }
        ]
    })
    print("   ✅ Seeded VPO workspace")

    # ── MEMBER 2: Match Results ──
    db.match_results.insert_one({
        "job_id": 1,
        "matches": [
            {"freelancer_id": 5, "match_score": 85.0, "trust_score": 80.0},
            {"freelancer_id": 6, "match_score": 83.3, "trust_score": 78.3},
            {"freelancer_id": 4, "match_score": 81.5, "trust_score": 76.5}
        ],
        "total": 3,
        "calculated_at": datetime.utcnow().isoformat()
    })

    # ── MEMBER 4: Payment Records ──
    db.payment_records.insert_one({
        "payment_id": "pay_1_1",
        "contract_id": 1,
        "milestone_id": 1,
        "freelancer_id": 4,
        "client_id": 2,
        "amount": 1000.0,
        "status": "released",
        "released_at": datetime.utcnow().isoformat(),
        "escrow_after": 4000.0
    })

    # ── MEMBER 4: Freelancer Earnings ──
    db.freelancer_earnings.insert_one({
        "freelancer_id": 4,
        "total_earnings": 1000.0,
        "completed_milestones": 1,
        "updated_at": datetime.utcnow().isoformat()
    })

    print("\n✅ All collections seeded (including Member 3 & 4)")


def create_indexes():
    print("\n" + "="*60)
    print("PHASE 2: Indexing")
    print("="*60)
    
    client = get_client()
    db = client[settings.mongodb_db]
    
    # ── Existing indexes ──
    db.work_sessions.create_index([("freelancer_id", ASCENDING), ("session_id", ASCENDING)])
    db.messages.create_index([("project_id", ASCENDING), ("sent_at", ASCENDING)])
    db.behavioral_logs.create_index([("freelancer_id", ASCENDING), ("recorded_at", ASCENDING)])
    db.submissions.create_index([("contract_id", ASCENDING), ("version", ASCENDING)])
    db.task_briefs.create_index([("tags", TEXT)])
    db.baseline_challenges.create_index([("category", ASCENDING), ("difficulty", ASCENDING)])
    db.baseline_challenges.create_index([("challenge_id", ASCENDING)], unique=True)
    db.fraud_logs.create_index([("user_id", ASCENDING), ("flagged_at", ASCENDING)])

    # ── MEMBER 3 & 4: New indexes ──
    db.vpo_workspaces.create_index([("contract_id", ASCENDING)], unique=True)
    db.vpo_workspaces.create_index([("freelancer_id", ASCENDING), ("client_id", ASCENDING)])
    db.match_results.create_index([("job_id", ASCENDING)], unique=True)
    db.payment_records.create_index([("contract_id", ASCENDING), ("milestone_id", ASCENDING)])
    db.payment_records.create_index([("freelancer_id", ASCENDING), ("released_at", ASCENDING)])
    db.freelancer_earnings.create_index([("freelancer_id", ASCENDING)], unique=True)
    db.fraud_logs.create_index([("submission_id", ASCENDING)])
    db.submissions.create_index([("fraud_status", ASCENDING), ("submitted_at", ASCENDING)])

    print("✅ Indexes Created (including Member 3 & 4)")


def demonstrate_projection():
    print("\n" + "="*60)
    print("PHASE 3: Projection")
    print("="*60)
    
    client = get_client()
    db = client[settings.mongodb_db]
    
    result = db.task_briefs.find_one({"job_id": 1}, {"_id": 0, "full_description": 0})
    print(f"\n📊 Projection (exclude full_description): {list(result.keys())}")
    
    results = db.messages.find({"project_id": 1}, {"_id": 0, "sender_id": 1, "body": 1})
    for msg in results:
        print(f"   Sender {msg['sender_id']}: {msg['body'][:40]}...")

    # ── MEMBER 3 & 4: Additional projections ──
    result = db.vpo_workspaces.find_one(
        {"contract_id": 1},
        {"_id": 0, "tasks": {"title": 1, "status": 1}, "messages": 0}
    )
    print(f"\n📊 VPO Projection (tasks only): {list(result.keys())}")


def seed_all():
    print("\n" + "🚀"*30)
    print("SKILLSYNC AI — MONGODB SEED")
    print("🚀"*30)
    
    seed_collections()
    create_indexes()
    demonstrate_projection()
    
    print("\n" + "="*60)
    print("✅ MONGODB SEED COMPLETE")
    print("="*60)


if __name__ == "__main__":
    seed_all()