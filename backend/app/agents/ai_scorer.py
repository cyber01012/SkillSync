"""AI Scorer — Gemini API with key rotation."""
import json
import os
import re
from typing import Optional

from app.celery_app import celery_app
from app.core.config import get_settings

_key_counter = 0


def _get_rotated_key(session_id: str) -> Optional[str]:
    settings = get_settings()
    keys = [k for k in [settings.gemini_api_key_1, settings.gemini_api_key_2] if k]
    if not keys:
        return None
    idx = hash(session_id) % len(keys)
    return keys[idx]


def _parse_scores(text: str) -> dict:
    """Extract JSON scores from Gemini response."""
    default = {"technical": 50, "creativity": 50, "performance": 50}
    try:
        match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return {
                "technical": max(0, min(100, int(data.get("technical", 50)))),
                "creativity": max(0, min(100, int(data.get("creativity", 50)))),
                "performance": max(0, min(100, int(data.get("performance", 50)))),
            }
    except (json.JSONDecodeError, ValueError, TypeError):
        pass
    return default


def call_gemini(code: str, prompt_template: str, session_id: str) -> dict:
    """Call Gemini API with key rotation and fallback."""
    settings = get_settings()
    keys = [k for k in [settings.gemini_api_key_1, settings.gemini_api_key_2] if k]
    if not keys:
        return {"technical": 50, "creativity": 50, "performance": 50}

    prompt = f"{prompt_template}\n\nCode:\n```\n{code[:8000]}\n```"
    ordered_keys = keys.copy()
    start_idx = hash(session_id) % len(keys)
    ordered_keys = ordered_keys[start_idx:] + ordered_keys[:start_idx]

    for api_key in ordered_keys:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            return _parse_scores(response.text)
        except Exception as e:
            print(f"Gemini API call failed with key: {api_key[:5]}... Error: {e}")
            continue

    return {"technical": 50, "creativity": 50, "performance": 50}


@celery_app.task(bind=True, max_retries=3)
def ai_scorer_task(self, session_id: str, code: str, prompt_template: str):
    from datetime import datetime

    from app.core.database import get_mongo_client
    from app.core.config import get_settings as gs

    settings = gs()
    client = get_mongo_client()
    db = client[settings.mongodb_db]

    scores = call_gemini(code, prompt_template, session_id)

    db.work_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ai_score": scores,
            "ai_scored_at": datetime.utcnow().isoformat(),
        }},
    )

    try:
        from app.agents.skill_dna_agent import skill_dna_agent_task
        skill_dna_agent_task.delay(session_id)
    except Exception:
        from app.agents.skill_dna_agent import run_skill_dna_sync
        run_skill_dna_sync(session_id)

    return scores


def run_ai_scorer_sync(session_id: str, code: str, prompt_template: str) -> dict:
    """Synchronous fallback when Celery is unavailable."""
    from datetime import datetime

    from app.core.database import get_mongo_client
    from app.core.config import get_settings as gs

    settings = gs()
    client = get_mongo_client()
    db = client[settings.mongodb_db]

    scores = call_gemini(code, prompt_template, session_id)
    db.work_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ai_score": scores,
            "ai_scored_at": datetime.utcnow().isoformat(),
        }},
    )

    from app.agents.skill_dna_agent import run_skill_dna_sync
    run_skill_dna_sync(session_id)
    return scores