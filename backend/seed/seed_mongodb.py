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
    
    collections = [
        'task_briefs', 'work_sessions', 'submissions',
        'messages', 'rubric_templates', 'behavioral_logs', 'fraud_logs',
        'baseline_challenges',
    ]
    for col in collections:
        db[col].drop()
        print(f"   ✅ Recreated: {col}")
    
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
        "ai_score": 0.15
    })
    
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
    
    db.rubric_templates.insert_one({
        "rubric_id": 1,
        "created_by": 2,
        "criteria": [
            {"name": "Code Quality", "weight": 0.30, "description": "Clean, readable code", "scoring_guide": {"excellent": "90-100"}},
            {"name": "Functionality", "weight": 0.40, "description": "All requirements implemented", "scoring_guide": {"excellent": "90-100"}}
        ],
        "created_at": datetime.utcnow().isoformat()
    })
    
    db.behavioral_logs.insert_many([
        {"log_id": "bl_001", "freelancer_id": 4, "session_id": "baseline_4_1", "event_type": "code_read", "value": 5, "recorded_at": "2026-06-10T10:00:05Z"},
        {"log_id": "bl_002", "freelancer_id": 4, "session_id": "baseline_4_1", "event_type": "bug_fix", "value": 3, "recorded_at": "2026-06-10T10:01:15Z"}
    ])
    
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

    challenges = get_baseline_challenges()
    db.baseline_challenges.insert_many(challenges)
    print(f"   ✅ Seeded {len(challenges)} baseline challenges")

    print("\n✅ All collections seeded")


def create_indexes():
    print("\n" + "="*60)
    print("PHASE 2: Indexing")
    print("="*60)
    
    client = get_client()
    db = client[settings.mongodb_db]
    
    db.work_sessions.create_index([("freelancer_id", ASCENDING), ("session_id", ASCENDING)])
    db.messages.create_index([("project_id", ASCENDING), ("sent_at", ASCENDING)])
    db.behavioral_logs.create_index([("freelancer_id", ASCENDING), ("recorded_at", ASCENDING)])
    db.submissions.create_index([("contract_id", ASCENDING), ("version", ASCENDING)])
    db.task_briefs.create_index([("tags", TEXT)])
    db.baseline_challenges.create_index([("category", ASCENDING), ("difficulty", ASCENDING)])
    db.baseline_challenges.create_index([("challenge_id", ASCENDING)], unique=True)
    db.fraud_logs.create_index([("user_id", ASCENDING), ("flagged_at", ASCENDING)])

    print("✅ Indexes Created")


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