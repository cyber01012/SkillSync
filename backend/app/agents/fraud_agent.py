"""Fraud Detection Agent — Analyzes submissions for AI-generated content, plagiarism, anomalies.
Triggered on every new submission.
Uses: Content analysis, behavioral patterns, device fingerprinting."""
import json
from datetime import datetime, timezone

from app.celery_app import celery_app
from app.core.database import get_mongo_client, SessionLocal
from app.core.config import get_settings
from app.models import FreelancerProfile, TrustScore, Contract


@celery_app.task(bind=True, max_retries=3)
def fraud_detection_task(self, submission_id: str, contract_id: int):
    """Run fraud detection on a submission."""
    db = SessionLocal()
    try:
        settings = get_settings()
        client = get_mongo_client()
        mongo_db = client[settings.mongodb_db]

        # Get submission
        submission = mongo_db.submissions.find_one({"submission_id": submission_id})
        if not submission:
            return {"status": "error", "message": "Submission not found"}

        contract = db.query(Contract).filter(Contract.ContractID == contract_id).first()
        if not contract:
            return {"status": "error", "message": "Contract not found"}

        freelancer = db.query(FreelancerProfile).filter(
            FreelancerProfile.FreelancerID == contract.FreelancerID
        ).first()

        # ── FRAUD DETECTION LOGIC ──
        flags = []
        total_confidence = 0.0
        is_flagged = False

        # 1. AI-Generated Content Detection
        text_content = submission.get("text_content", "")
        ai_score = _detect_ai_content(text_content)
        if ai_score > 0.7:
            flags.append({
                "type": "ai_content",
                "confidence": ai_score,
                "details": "High probability of AI-generated content",
            })
            total_confidence += ai_score
            is_flagged = True

        # 2. Submission Speed Analysis (too fast = suspicious)
        submitted_at = submission.get("submitted_at")
        if submitted_at:
            # Check if multiple submissions in short time
            recent_submissions = mongo_db.submissions.find({
                "contract_id": contract_id,
                "submitted_at": {"$gte": _hours_ago(1)},
            })
            recent_count = len(list(recent_submissions))
            if recent_count > 3:
                speed_score = min(0.9, recent_count * 0.2)
                flags.append({
                    "type": "rapid_submissions",
                    "confidence": speed_score,
                    "details": f"{recent_count} submissions in 1 hour",
                })
                total_confidence += speed_score
                is_flagged = True

        # 3. File Anomaly Detection
        files = submission.get("files", [])
        for file in files:
            file_size = file.get("size", 0)
            if file_size > 50 * 1024 * 1024:  # > 50MB
                flags.append({
                    "type": "oversized_file",
                    "confidence": 0.6,
                    "details": f"File {file.get('filename')} exceeds 50MB",
                })
                total_confidence += 0.6

        # 4. Trust Score Correlation
        trust = db.query(TrustScore).filter(
            TrustScore.FreelancerID == contract.FreelancerID
        ).first()
        if trust and trust.OverallScore < 50:
            flags.append({
                "type": "low_trust_score",
                "confidence": 0.4,
                "details": f"Freelancer trust score {trust.OverallScore:.1f} below threshold",
            })
            total_confidence += 0.4

        # 5. Behavioral Pattern Analysis (from work_sessions)
        work_sessions = mongo_db.work_sessions.find({
            "freelancer_id": contract.FreelancerID,
        }).sort("submitted_at", -1).limit(5)

        session_list = list(work_sessions)
        if len(session_list) >= 2:
            # Check for identical patterns (copy-paste behavior)
            steps_hashes = []
            for session in session_list:
                steps = session.get("steps", [])
                steps_str = json.dumps(steps, sort_keys=True)
                steps_hashes.append(hash(steps_str))

            if len(set(steps_hashes)) < len(steps_hashes):
                flags.append({
                    "type": "repetitive_behavior",
                    "confidence": 0.75,
                    "details": "Identical work patterns detected across sessions",
                })
                total_confidence += 0.75
                is_flagged = True

        # Calculate overall confidence
        overall_confidence = min(1.0, total_confidence / max(len(flags), 1))

        # Store fraud log
        fraud_log = {
            "log_id": f"fraud_{submission_id}",
            "submission_id": submission_id,
            "contract_id": contract_id,
            "freelancer_id": contract.FreelancerID,
            "detection_type": "multi_factor",
            "evidence": {
                "flags": flags,
                "ai_score": ai_score,
                "overall_confidence": overall_confidence,
                "submission_text_preview": text_content[:200] if text_content else "",
            },
            "confidence_score": overall_confidence,
            "flagged_at": datetime.now(timezone.utc).isoformat(),
            "status": "flagged" if is_flagged else "cleared",
            "reviewed_by": None,
            "reviewed_at": None,
        }

        mongo_db.fraud_logs.insert_one(fraud_log)

        # Update submission with fraud result
        mongo_db.submissions.update_one(
            {"submission_id": submission_id},
            {"$set": {
                "ai_score": ai_score,
                "fraud_flags": flags,
                "fraud_status": "flagged" if is_flagged else "cleared",
                "fraud_checked_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

        # Update VPO workspace
        mongo_db.vpo_workspaces.update_one(
            {"contract_id": contract_id, "submissions.submission_id": submission_id},
            {"$set": {
                "submissions.$.ai_score": ai_score,
                "submissions.$.fraud_flags": flags,
                "submissions.$.fraud_status": "flagged" if is_flagged else "cleared",
            }}
        )

        # If flagged, create alert in FlaggedAccounts (SQL)
        if is_flagged and overall_confidence > 0.7:
            from app.models import FlaggedAccounts
            flagged = FlaggedAccounts(
                UserID=contract.FreelancerID,
                FlagType="fraud_submission",
                Severity="high" if overall_confidence > 0.85 else "medium",
            )
            db.add(flagged)
            db.commit()

        print(f"[FRAUD AGENT] Submission {submission_id}: {len(flags)} flags, confidence {overall_confidence:.2f}")

        return {
            "status": "flagged" if is_flagged else "cleared",
            "submission_id": submission_id,
            "flags_count": len(flags),
            "confidence_score": overall_confidence,
            "flags": flags,
        }

    except Exception as e:
        print(f"[FRAUD AGENT] Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


def _detect_ai_content(text: str) -> float:
    """Detect AI-generated content probability (0-1)."""
    if not text or len(text) < 50:
        return 0.0

    # Heuristic-based detection (replace with actual AI model in production)
    score = 0.0

    # Check for repetitive patterns
    sentences = text.split(".")
    if len(sentences) > 5:
        avg_len = sum(len(s.strip()) for s in sentences) / len(sentences)
        if 40 < avg_len < 80:  # AI tends to have uniform sentence lengths
            score += 0.2

    # Check for common AI phrases
    ai_phrases = [
        "in conclusion", "furthermore", "moreover", "it is important to note",
        "additionally", "consequently", "therefore", "in summary",
    ]
    text_lower = text.lower()
    phrase_count = sum(1 for phrase in ai_phrases if phrase in text_lower)
    if phrase_count > 2:
        score += min(0.3, phrase_count * 0.1)

    # Check for perfect grammar (AI hallmark)
    # Simplified: check punctuation consistency
    punct_ratio = text.count(",") / max(len(text), 1)
    if 0.01 < punct_ratio < 0.05:
        score += 0.15

    # Check lexical diversity (AI tends to repeat words)
    words = text_lower.split()
    if len(words) > 20:
        unique_words = len(set(words))
        diversity = unique_words / len(words)
        if diversity < 0.4:  # Low diversity = suspicious
            score += 0.25

    return min(1.0, score)


def _hours_ago(hours: int):
    """Get ISO timestamp for N hours ago."""
    from datetime import timedelta
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()