"""Skill DNA Agent — Member 1's Agent.

Trigger: Work session or live challenge ends
Actions: Reads behavioral log entries from MongoDB → recalculates trait scores
         → updates SkillScores table → takes DNA snapshot for history

DB touch: SQL Server: SkillScores, DNASnapshots | MongoDB: BehavioralLogs
"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import SessionLocal
from app.models import SkillScore, DNASnapshot


def recalculate_skill_dna(freelancer_id: int, behavioral_data: dict):
    """Recalculate Skill DNA traits based on behavioral data from a session.
    
    This is the core agent function. It runs as a Celery task in production.
    For now, it runs synchronously after baseline challenge submission.
    """
    db = SessionLocal()
    try:
        # Get current scores
        scores = db.query(SkillScore).filter(
            SkillScore.FreelancerID == freelancer_id
        ).all()
        
        score_map = {s.TraitName: s.Score for s in scores}
        
        # Calculate adjustments based on behavioral data
        # This simulates the AI analysis of work patterns
        adjustments = {
            "Reliability": behavioral_data.get("reliability_delta", 0),
            "Creativity": behavioral_data.get("creativity_delta", 0),
            "Teamwork": behavioral_data.get("teamwork_delta", 0),
            "Communication": behavioral_data.get("communication_delta", 0),
            "Deadline Adherence": behavioral_data.get("deadline_delta", 0),
            "Technical Accuracy": behavioral_data.get("technical_delta", 0),
        }
        
        # Apply weighted adjustments (dampened to prevent gaming)
        for trait_name, delta in adjustments.items():
            if trait_name in score_map:
                new_score = max(0, min(100, score_map[trait_name] + int(delta * 0.3)))
                score_map[trait_name] = new_score
                
                # Update in DB
                skill = db.query(SkillScore).filter(
                    SkillScore.FreelancerID == freelancer_id,
                    SkillScore.TraitName == trait_name,
                ).first()
                if skill:
                    skill.Score = new_score
        
        # Take DNA Snapshot
        snapshot_data = ", ".join([f'"{k}": {v}' for k, v in score_map.items()])
        db.add(DNASnapshot(
            FreelancerID=freelancer_id,
            SnapshotData="{" + snapshot_data + "}",
        ))
        
        db.commit()
        
        return {
            "status": "success",
            "freelancer_id": freelancer_id,
            "updated_traits": score_map,
            "snapshot_taken": True,
        }
        
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


# Celery task wrapper (for when Celery is set up)
# from celery import Celery
# celery_app = Celery("skill_dna", broker="redis://localhost:6379/0")
# 
# @celery_app.task
def skill_dna_agent_task(freelancer_id: int, behavioral_data: dict):
    """Celery task wrapper for the Skill DNA Agent."""
    return recalculate_skill_dna(freelancer_id, behavioral_data)