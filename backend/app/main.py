"""SkillSync AI — FastAPI Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.routers import auth, baseline, dna, profile, categories, jobs
from app.core.database import Base, engine

# Create all SQL Server tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillSync AI",
    description="Proof-Based Freelancing Platform — Agentic AI Architecture",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for profile photo uploads
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(categories.router)
app.include_router(baseline.router)
app.include_router(dna.router)
app.include_router(jobs.router)


@app.get("/")
def root():
    return {"message": "SkillSync AI API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "agents": ["Skill DNA Agent"], "databases": ["SQL Server", "MongoDB"]}