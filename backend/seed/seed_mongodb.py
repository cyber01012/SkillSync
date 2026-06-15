"""MongoDB Seed Script — Fixed Version."""
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
    print("" + "="*60)
    print("PHASE 1: NoSQL Collections")
    print("="*60)

    client = get_client()
    db = client[settings.mongodb_db]

    # Drop all existing collections
    collections = [
        'task_briefs', 'work_sessions', 'submissions',
        'messages', 'rubric_templates', 'behavioral_logs', 'fraud_logs',
        'baseline_challenges', 'vpo_workspaces', 'match_results', 
        'payment_records', 'freelancer_earnings', 'trust_score_updates'
    ]
    for col in collections:
        db[col].drop()
        print(f"   ✅ Recreated: {col}")

    # ── Task Briefs (8 jobs) ──
    db.task_briefs.insert_many([
        {
            "job_id": 1,
            "title": "Build E-Commerce Dashboard",
            "full_description": "We need a full-stack developer to build a React + FastAPI e-commerce dashboard with product management, order tracking, analytics charts, and payment integration. Must be responsive and support dark mode.",
            "required_tools": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS", "Chart.js"],
            "tags": ["frontend", "backend", "dashboard", "e-commerce"],
            "budget_range": {"min": 2000, "max": 5000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-15T00:00:00Z"
        },
        {
            "job_id": 2,
            "title": "AI Chatbot Integration",
            "full_description": "Integrate Claude API into existing customer support system. Build conversation flow, context management, and fallback to human agents. Include analytics dashboard for conversation metrics.",
            "required_tools": ["Python", "OpenAI API", "FastAPI", "Redis", "React"],
            "tags": ["ai", "backend", "api-integration", "nlp"],
            "budget_range": {"min": 3000, "max": 8000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-08-01T00:00:00Z"
        },
        {
            "job_id": 3,
            "title": "Brand Identity Design",
            "full_description": "Create complete brand identity for tech startup including logo, color palette, typography, business cards, and brand guidelines document. Must be modern and memorable.",
            "required_tools": ["Figma", "Adobe Illustrator", "Adobe Photoshop"],
            "tags": ["design", "branding", "ui-ux", "creative"],
            "budget_range": {"min": 1000, "max": 3000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-01T00:00:00Z"
        },
        {
            "job_id": 4,
            "title": "Mobile App UI/UX",
            "full_description": "Design complete UI/UX for fitness tracking mobile app. Include onboarding, workout tracking, progress charts, social features, and settings. Must follow iOS and Android guidelines.",
            "required_tools": ["Figma", "Sketch", "Principle"],
            "tags": ["mobile", "ui-ux", "design", "fitness"],
            "budget_range": {"min": 2500, "max": 5000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-20T00:00:00Z"
        },
        {
            "job_id": 5,
            "title": "SaaS Platform Backend",
            "full_description": "Build scalable backend for SaaS platform using Python + FastAPI. Include multi-tenant architecture, RBAC, subscription management, webhooks, and API rate limiting.",
            "required_tools": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
            "tags": ["backend", "saas", "api", "scalable"],
            "budget_range": {"min": 5000, "max": 12000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-08-15T00:00:00Z"
        },
        {
            "job_id": 6,
            "title": "API Gateway Development",
            "full_description": "Develop API gateway using Node.js with rate limiting, authentication, request routing, load balancing, and monitoring. Must handle 10K+ requests per second.",
            "required_tools": ["Node.js", "Express", "Redis", "Nginx", "Docker"],
            "tags": ["backend", "api", "gateway", "devops"],
            "budget_range": {"min": 3000, "max": 7000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-30T00:00:00Z"
        },
        {
            "job_id": 7,
            "title": "Enterprise CRM System",
            "full_description": "Build enterprise CRM with lead management, pipeline tracking, email integration, reporting dashboards, and team collaboration features. Must integrate with Salesforce and HubSpot.",
            "required_tools": ["React", "Node.js", "MongoDB", "Express", "AWS"],
            "tags": ["frontend", "backend", "crm", "enterprise"],
            "budget_range": {"min": 4000, "max": 10000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-08-30T00:00:00Z"
        },
        {
            "job_id": 8,
            "title": "DevOps Pipeline Setup",
            "full_description": "Set up complete CI/CD pipeline with GitHub Actions, Docker, Kubernetes, monitoring with Prometheus/Grafana, and automated testing. Include infrastructure as code with Terraform.",
            "required_tools": ["Docker", "Kubernetes", "Terraform", "AWS", "GitHub Actions"],
            "tags": ["devops", "ci-cd", "infrastructure", "cloud"],
            "budget_range": {"min": 2500, "max": 6000, "currency": "USD"},
            "posted_at": datetime.utcnow().isoformat(),
            "deadline": "2026-07-10T00:00:00Z"
        }
    ])
    print("   ✅ Seeded 8 task briefs")

    # ── Work Sessions (5 freelancers) ──
    db.work_sessions.insert_many([
        {
            "session_id": "baseline_6_1",
            "freelancer_id": 6,
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
        },
        {
            "session_id": "baseline_7_1",
            "freelancer_id": 7,
            "challenge_id": 2,
            "steps": [
                {"timestamp": "2026-06-10T11:00:00Z", "action": "read_code", "content": "Analyzed React component"},
                {"timestamp": "2026-06-10T11:05:00Z", "action": "identify_bug", "content": "Found state management issue"},
                {"timestamp": "2026-06-10T11:10:00Z", "action": "write_fix", "content": "Implemented useReducer"},
                {"timestamp": "2026-06-10T11:15:00Z", "action": "test", "content": "All tests passed"},
                {"timestamp": "2026-06-10T11:20:00Z", "action": "submit", "content": "Submitted solution"}
            ],
            "duration_ms": 1200000,
            "output_url": None,
            "submitted_at": "2026-06-10T11:20:00Z",
            "type": "baseline"
        }
    ])
    print("   ✅ Seeded 2 work sessions")

    # ── Submissions (6 submissions across contracts) ──
    db.submissions.insert_many([
        {
            "submission_id": "sub_001",
            "contract_id": 1,
            "freelancer_id": 6,
            "version": 1,
            "files": [
                {"filename": "dashboard_v1.zip", "url": "/uploads/dashboard_v1.zip", "size": 2048000}
            ],
            "text_content": "Initial dashboard implementation with React components and FastAPI backend. Includes product listing, order management, and basic analytics.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.15,
            "fraud_flags": [],
            "fraud_status": "cleared",
            "status": "pending_review"
        },
        {
            "submission_id": "sub_002",
            "contract_id": 1,
            "freelancer_id": 6,
            "version": 2,
            "files": [
                {"filename": "dashboard_v2.zip", "url": "/uploads/dashboard_v2.zip", "size": 2150000}
            ],
            "text_content": "Updated dashboard with dark mode, improved charts, and payment integration. Added responsive design for mobile devices.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.12,
            "fraud_flags": [],
            "fraud_status": "cleared",
            "status": "approved"
        },
        {
            "submission_id": "sub_003",
            "contract_id": 2,
            "freelancer_id": 8,
            "version": 1,
            "files": [
                {"filename": "chatbot_integration.zip", "url": "/uploads/chatbot_integration.zip", "size": 1800000}
            ],
            "text_content": "Claude API integration with conversation flow management. Includes context handling and fallback to human agents.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.08,
            "fraud_flags": [],
            "fraud_status": "cleared",
            "status": "pending_review"
        },
        {
            "submission_id": "sub_004",
            "contract_id": 3,
            "freelancer_id": 7,
            "version": 1,
            "files": [
                {"filename": "brand_identity.zip", "url": "/uploads/brand_identity.zip", "size": 1500000}
            ],
            "text_content": "Complete brand identity package including logo variations, color palette, typography guide, and business card designs.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.05,
            "fraud_flags": [],
            "fraud_status": "cleared",
            "status": "approved"
        },
        {
            "submission_id": "sub_005",
            "contract_id": 5,
            "freelancer_id": 10,
            "version": 1,
            "files": [
                {"filename": "saas_backend.zip", "url": "/uploads/saas_backend.zip", "size": 3200000}
            ],
            "text_content": "Multi-tenant SaaS backend with RBAC, subscription management, and webhook support. Includes API documentation.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.10,
            "fraud_flags": [],
            "fraud_status": "cleared",
            "status": "approved"
        },
        {
            "submission_id": "sub_006",
            "contract_id": 6,
            "freelancer_id": 6,
            "version": 1,
            "files": [
                {"filename": "api_gateway.zip", "url": "/uploads/api_gateway.zip", "size": 2100000}
            ],
            "text_content": "API gateway with rate limiting, authentication, and request routing. Load balancing and monitoring included.",
            "submitted_at": datetime.utcnow().isoformat(),
            "ai_score": 0.18,
            "fraud_flags": [
                {"type": "rapid_submission", "details": "Submitted within 2 hours of milestone start"}
            ],
            "fraud_status": "flagged",
            "status": "under_review"
        }
    ])
    print("   ✅ Seeded 6 submissions")

    # ── Messages (10 messages across projects) ──
    db.messages.insert_many([
        {
            "msg_id": "msg_001",
            "project_id": 1,
            "sender_id": 2,
            "sender_name": "client1",
            "sender_role": "client",
            "body": "Hi Ali, thanks for applying. Can you start Monday?",
            "attachments": [],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [6]
        },
        {
            "msg_id": "msg_002",
            "project_id": 1,
            "sender_id": 6,
            "sender_name": "freelancer1",
            "sender_role": "freelancer",
            "body": "Yes, I can start Monday. Should I use the existing design system or create a new one?",
            "attachments": [],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [2]
        },
        {
            "msg_id": "msg_003",
            "project_id": 2,
            "sender_id": 2,
            "sender_name": "client1",
            "sender_role": "client",
            "body": "Omar, the chatbot needs to handle 1000 concurrent users. Can you scale it?",
            "attachments": [],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [8]
        },
        {
            "msg_id": "msg_004",
            "project_id": 2,
            "sender_id": 8,
            "sender_name": "freelancer3",
            "sender_role": "freelancer",
            "body": "Absolutely. I'll use Redis for session management and implement connection pooling.",
            "attachments": [],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [2]
        },
        {
            "msg_id": "msg_005",
            "project_id": 3,
            "sender_id": 3,
            "sender_name": "client2",
            "sender_role": "client",
            "body": "Sara, the logo looks great! Can we try a blue color variant?",
            "attachments": [{"filename": "logo_v1.png", "url": "/uploads/logo_v1.png"}],
            "sent_at": datetime.utcnow().isoformat(),
            "read_by": [7]
        }
    ])
    print("   ✅ Seeded 5 messages")

    # ── Rubric Templates ──
    db.rubric_templates.insert_one({
        "rubric_id": 1,
        "created_by": 2,
        "criteria": [
            {"name": "Code Quality", "weight": 0.30, "description": "Clean, readable code", "scoring_guide": {"excellent": "90-100"}},
            {"name": "Functionality", "weight": 0.40, "description": "All requirements implemented", "scoring_guide": {"excellent": "90-100"}},
            {"name": "Documentation", "weight": 0.15, "description": "Clear comments and docs", "scoring_guide": {"excellent": "90-100"}},
            {"name": "Testing", "weight": 0.15, "description": "Unit tests and coverage", "scoring_guide": {"excellent": "90-100"}}
        ],
        "created_at": datetime.utcnow().isoformat()
    })
    print("   ✅ Seeded rubric templates")

    # ── Behavioral Logs ──
    db.behavioral_logs.insert_many([
        {"log_id": "bl_001", "freelancer_id": 6, "session_id": "baseline_6_1", "event_type": "code_read", "value": 5, "recorded_at": "2026-06-10T10:00:05Z"},
        {"log_id": "bl_002", "freelancer_id": 6, "session_id": "baseline_6_1", "event_type": "bug_fix", "value": 3, "recorded_at": "2026-06-10T10:01:15Z"},
        {"log_id": "bl_003", "freelancer_id": 7, "session_id": "baseline_7_1", "event_type": "code_read", "value": 4, "recorded_at": "2026-06-10T11:00:00Z"},
        {"log_id": "bl_004", "freelancer_id": 7, "session_id": "baseline_7_1", "event_type": "optimization", "value": 5, "recorded_at": "2026-06-10T11:10:00Z"}
    ])
    print("   ✅ Seeded behavioral logs")

    # ── Fraud Logs ──
    db.fraud_logs.insert_many([
        {
            "log_id": "fl_001",
            "user_id": 99,
            "detection_type": "ai_content",
            "evidence": {"ai_probability": 0.87, "model_detected": "GPT-4"},
            "confidence_score": 0.92,
            "flagged_at": datetime.utcnow().isoformat()
        },
        {
            "log_id": "fl_002",
            "user_id": 6,
            "submission_id": "sub_006",
            "detection_type": "rapid_submission",
            "evidence": {"time_threshold": 7200, "actual_time": 3600},
            "confidence_score": 0.75,
            "flagged_at": datetime.utcnow().isoformat()
        }
    ])
    print("   ✅ Seeded fraud logs")

    # ── Baseline Challenges ──
    challenges = get_baseline_challenges()
    db.baseline_challenges.insert_many(challenges)
    print(f"   ✅ Seeded {len(challenges)} baseline challenges")

    # ── VPO Workspaces (6 contracts) ──
    db.vpo_workspaces.insert_many([
        {
            "contract_id": 1,
            "job_id": 1,
            "client_id": 2,
            "freelancer_id": 6,
            "created_at": datetime.utcnow().isoformat(),
            "tasks": [
                {
                    "task_id": "task_1_1",
                    "contract_id": 1,
                    "title": "Setup project structure",
                    "description": "Initialize React + FastAPI project with Docker",
                    "status": "done",
                    "assignee_id": 6,
                    "created_by": 2,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-06-20T00:00:00Z"
                },
                {
                    "task_id": "task_1_2",
                    "contract_id": 1,
                    "title": "Build authentication module",
                    "description": "JWT auth with login/register and role-based access",
                    "status": "in_progress",
                    "assignee_id": 6,
                    "created_by": 2,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-06-25T00:00:00Z"
                },
                {
                    "task_id": "task_1_3",
                    "contract_id": 1,
                    "title": "Create dashboard UI",
                    "description": "Responsive dashboard with charts and data tables",
                    "status": "todo",
                    "assignee_id": 6,
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
                    "read_by": [2, 6]
                },
                {
                    "msg_id": "msg_1_2",
                    "contract_id": 1,
                    "sender_id": 6,
                    "sender_name": "Ali Khan",
                    "sender_role": "freelancer",
                    "body": "Thanks! I've started the project setup. Will update you by EOD.",
                    "attachments": [],
                    "sent_at": datetime.utcnow().isoformat(),
                    "read_by": [2]
                }
            ],
            "submissions": [
                {
                    "submission_id": "sub_1_1",
                    "contract_id": 1,
                    "milestone_id": 1,
                    "freelancer_id": 6,
                    "version": 1,
                    "files": [
                        {"filename": "project_setup.zip", "url": "/uploads/project_setup.zip", "size": 1024000}
                    ],
                    "text_content": "Project structure initialized with React and FastAPI. Docker compose setup included.",
                    "submitted_at": datetime.utcnow().isoformat(),
                    "ai_score": 0.05,
                    "fraud_flags": [],
                    "status": "approved"
                }
            ]
        },
        {
            "contract_id": 2,
            "job_id": 2,
            "client_id": 2,
            "freelancer_id": 8,
            "created_at": datetime.utcnow().isoformat(),
            "tasks": [
                {
                    "task_id": "task_2_1",
                    "contract_id": 2,
                    "title": "API integration research",
                    "description": "Research Claude API capabilities and limitations",
                    "status": "done",
                    "assignee_id": 8,
                    "created_by": 2,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-07-01T00:00:00Z"
                },
                {
                    "task_id": "task_2_2",
                    "contract_id": 2,
                    "title": "Conversation flow design",
                    "description": "Design conversation flow and context management",
                    "status": "in_progress",
                    "assignee_id": 8,
                    "created_by": 2,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-07-10T00:00:00Z"
                }
            ],
            "messages": [
                {
                    "msg_id": "msg_2_1",
                    "contract_id": 2,
                    "sender_id": 2,
                    "sender_name": "client1",
                    "sender_role": "client",
                    "body": "Omar, please focus on the fallback mechanism first.",
                    "attachments": [],
                    "sent_at": datetime.utcnow().isoformat(),
                    "read_by": [8]
                }
            ],
            "submissions": []
        },
        {
            "contract_id": 3,
            "job_id": 3,
            "client_id": 3,
            "freelancer_id": 7,
            "created_at": datetime.utcnow().isoformat(),
            "tasks": [
                {
                    "task_id": "task_3_1",
                    "contract_id": 3,
                    "title": "Logo design",
                    "description": "Create 3 logo concepts",
                    "status": "done",
                    "assignee_id": 7,
                    "created_by": 3,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-05-15T00:00:00Z"
                },
                {
                    "task_id": "task_3_2",
                    "contract_id": 3,
                    "title": "Brand guidelines",
                    "description": "Complete brand guidelines document",
                    "status": "done",
                    "assignee_id": 7,
                    "created_by": 3,
                    "created_at": datetime.utcnow().isoformat(),
                    "due_date": "2026-05-20T00:00:00Z"
                }
            ],
            "messages": [],
            "submissions": [
                {
                    "submission_id": "sub_3_1",
                    "contract_id": 3,
                    "milestone_id": 8,
                    "freelancer_id": 7,
                    "version": 1,
                    "files": [
                        {"filename": "brand_package.zip", "url": "/uploads/brand_package.zip", "size": 1500000}
                    ],
                    "text_content": "Complete brand identity package delivered.",
                    "submitted_at": datetime.utcnow().isoformat(),
                    "ai_score": 0.03,
                    "fraud_flags": [],
                    "status": "approved"
                }
            ]
        }
    ])
    print("   ✅ Seeded 3 VPO workspaces")

    # ── Match Results (8 jobs) ──
    db.match_results.insert_many([
        {
            "job_id": 1,
            "matches": [
                {"freelancer_id": 6, "match_score": 85.0, "trust_score": 76.5},
                {"freelancer_id": 9, "match_score": 82.0, "trust_score": 82.0},
                {"freelancer_id": 10, "match_score": 78.0, "trust_score": 81.2}
            ],
            "total": 3,
            "calculated_at": datetime.utcnow().isoformat()
        },
        {
            "job_id": 2,
            "matches": [
                {"freelancer_id": 8, "match_score": 88.0, "trust_score": 78.3},
                {"freelancer_id": 6, "match_score": 75.0, "trust_score": 76.5},
                {"freelancer_id": 10, "match_score": 72.0, "trust_score": 81.2}
            ],
            "total": 3,
            "calculated_at": datetime.utcnow().isoformat()
        },
        {
            "job_id": 5,
            "matches": [
                {"freelancer_id": 10, "match_score": 90.0, "trust_score": 81.2},
                {"freelancer_id": 6, "match_score": 80.0, "trust_score": 76.5},
                {"freelancer_id": 8, "match_score": 78.0, "trust_score": 78.3}
            ],
            "total": 3,
            "calculated_at": datetime.utcnow().isoformat()
        }
    ])
    print("   ✅ Seeded match results")

    # ── Payment Records ──
    db.payment_records.insert_many([
        {
            "payment_id": "pay_1_1",
            "contract_id": 1,
            "milestone_id": 1,
            "freelancer_id": 6,
            "client_id": 2,
            "amount": 1000.0,
            "status": "released",
            "released_at": datetime.utcnow().isoformat(),
            "escrow_after": 4000.0
        },
        {
            "payment_id": "pay_2_1",
            "contract_id": 2,
            "milestone_id": 5,
            "freelancer_id": 8,
            "client_id": 2,
            "amount": 2000.0,
            "status": "released",
            "released_at": datetime.utcnow().isoformat(),
            "escrow_after": 6000.0
        },
        {
            "payment_id": "pay_3_1",
            "contract_id": 3,
            "milestone_id": 8,
            "freelancer_id": 7,
            "client_id": 3,
            "amount": 1000.0,
            "status": "released",
            "released_at": datetime.utcnow().isoformat(),
            "escrow_after": 2000.0
        }
    ])
    print("   ✅ Seeded payment records")

    # ── Freelancer Earnings ──
    db.freelancer_earnings.insert_many([
        {
            "freelancer_id": 6,
            "total_earnings": 1000.0,
            "completed_milestones": 1,
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "freelancer_id": 7,
            "total_earnings": 1000.0,
            "completed_milestones": 1,
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "freelancer_id": 8,
            "total_earnings": 2000.0,
            "completed_milestones": 1,
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "freelancer_id": 10,
            "total_earnings": 10000.0,
            "completed_milestones": 3,
            "updated_at": datetime.utcnow().isoformat()
        }
    ])
    print("   ✅ Seeded freelancer earnings")

    # ── Trust Score Updates ──
    db.trust_score_updates.insert_many([
        {
            "freelancer_id": 6,
            "contract_id": 1,
            "old_score": 70.0,
            "new_score": 76.5,
            "change": 6.5,
            "reason": "Contract 1 milestone approved",
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "freelancer_id": 7,
            "contract_id": 3,
            "old_score": 75.0,
            "new_score": 80.0,
            "change": 5.0,
            "reason": "Contract 3 completed successfully",
            "updated_at": datetime.utcnow().isoformat()
        }
    ])
    print("   ✅ Seeded trust score updates")

    print("✅ All collections seeded successfully")


def create_indexes():
    print("" + "="*60)
    print("PHASE 2: Indexing")
    print("="*60)

    client = get_client()
    db = client[settings.mongodb_db]

    # Existing indexes
    db.work_sessions.create_index([("freelancer_id", ASCENDING), ("session_id", ASCENDING)])
    db.messages.create_index([("project_id", ASCENDING), ("sent_at", ASCENDING)])
    db.behavioral_logs.create_index([("freelancer_id", ASCENDING), ("recorded_at", ASCENDING)])
    db.submissions.create_index([("contract_id", ASCENDING), ("version", ASCENDING)])
    db.task_briefs.create_index([("tags", TEXT)])
    db.baseline_challenges.create_index([("category", ASCENDING), ("difficulty", ASCENDING)])
    db.baseline_challenges.create_index([("challenge_id", ASCENDING)], unique=True)
    db.fraud_logs.create_index([("user_id", ASCENDING), ("flagged_at", ASCENDING)])

    # New indexes
    db.vpo_workspaces.create_index([("contract_id", ASCENDING)], unique=True)
    db.vpo_workspaces.create_index([("freelancer_id", ASCENDING), ("client_id", ASCENDING)])
    db.match_results.create_index([("job_id", ASCENDING)], unique=True)
    db.payment_records.create_index([("contract_id", ASCENDING), ("milestone_id", ASCENDING)])
    db.payment_records.create_index([("freelancer_id", ASCENDING), ("released_at", ASCENDING)])
    db.freelancer_earnings.create_index([("freelancer_id", ASCENDING)], unique=True)
    db.fraud_logs.create_index([("submission_id", ASCENDING)])
    db.submissions.create_index([("fraud_status", ASCENDING), ("submitted_at", ASCENDING)])
    db.trust_score_updates.create_index([("freelancer_id", ASCENDING), ("updated_at", ASCENDING)])

    print("✅ Indexes Created (including Member 3 & 4)")


def demonstrate_projection():
    print("" + "="*60)
    print("PHASE 3: Projection")
    print("="*60)

    client = get_client()
    db = client[settings.mongodb_db]

    # Projection 1: Exclude full_description (inclusion projection)
    result = db.task_briefs.find_one({"job_id": 1}, {"_id": 0, "title": 1, "tags": 1, "budget_range": 1})
    print(f"📊 Projection (title, tags, budget only): {list(result.keys())}")

    # Projection 2: Exclude _id and full_description (exclusion projection)
    result = db.task_briefs.find_one({"job_id": 2}, {"_id": 0, "full_description": 0})
    print(f"📊 Projection (exclude full_description): {list(result.keys())}")

    # Projection 3: Messages with sender info only
    results = db.messages.find({"project_id": 1}, {"_id": 0, "sender_name": 1, "body": 1, "sent_at": 1})
    for msg in results:
        print(f"   {msg['sender_name']}: {msg['body'][:40]}...")

    # Projection 4: VPO tasks only (exclude messages and submissions)
    result = db.vpo_workspaces.find_one(
        {"contract_id": 1},
        {"_id": 0, "tasks": 1, "contract_id": 1, "job_id": 1}
    )
    print(f"📊 VPO Projection (tasks only): {list(result.keys())}")
    print(f"   Tasks count: {len(result.get('tasks', []))}")

    print("✅ Projection demonstrations complete")


def seed_all():
    print("" + "🚀"*30)
    print("SKILLSYNC AI — MONGODB SEED")
    print("🚀"*30)

    seed_collections()
    create_indexes()
    demonstrate_projection()

    print("" + "="*60)
    print("✅ MONGODB SEED COMPLETE")
    print("="*60)


if __name__ == "__main__":
    seed_all()