"""Celery application configuration."""
import sys

from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "skillsync",
    broker=settings.redis_url or "redis://localhost:6379/0",
    backend=settings.redis_url or "redis://localhost:6379/0",
    include=[
        "app.agents.ai_scorer",
        "app.agents.skill_dna_agent",
        "app.agents.matching_agent",
        "app.agents.fraud_agent",      # NEW
        "app.agents.payment_agent",    # NEW
        "app.agents.trust_agent",      # NEW
    ],
)

celery_conf = {
    "task_serializer": "json",
    "accept_content": ["json"],
    "result_serializer": "json",
    "timezone": "UTC",
    "enable_utc": True,
    "task_track_started": True,
    "task_time_limit": 300,  # 5 minutes max per task
    "worker_prefetch_multiplier": 1,
    "broker_connection_retry_on_startup": True,
}

# Prefork is unsupported on Windows; solo pool runs tasks in-process.
if sys.platform == "win32":
    celery_conf.update(
        worker_pool="solo",
        worker_concurrency=1,
    )

celery_app.conf.update(celery_conf)