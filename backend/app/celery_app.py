"""Celery application configuration."""
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
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    worker_prefetch_multiplier=1,
)