"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ── AUTH ──
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(freelancer|client)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


# ── USER ──
class UserOut(BaseModel):
    UserID: int
    Username: str
    Email: str
    Role: str
    CreatedAt: Optional[datetime] = None
    IsVerified: bool

    class Config:
        from_attributes = True


# ── FREELANCER PROFILE ──
class FreelancerProfileCreate(BaseModel):
    display_name: str
    headline: Optional[str] = ""
    category: Optional[str] = ""


class FreelancerProfileOut(BaseModel):
    FreelancerID: int
    DisplayName: str
    Headline: Optional[str]
    Category: Optional[str]
    AvailabilityStatus: str

    class Config:
        from_attributes = True


# ── SKILL DNA ──
class SkillScoreOut(BaseModel):
    ScoreID: int
    TraitName: str
    Score: int
    UpdatedAt: Optional[datetime]

    class Config:
        from_attributes = True


class DNASnapshotOut(BaseModel):
    SnapshotID: int
    SnapshotData: str
    TakenAt: Optional[datetime]

    class Config:
        from_attributes = True


# ── CHALLENGE ──
class ChallengeSubmit(BaseModel):
    challenge_id: int
    steps: List[dict]  # [{timestamp, action, content}]
    duration_ms: int
    output_text: Optional[str] = ""


class ChallengeResultOut(BaseModel):
    ResultID: int
    ChallengeID: int
    Score: int
    TimeTaken: int
    CompletedAt: Optional[datetime]

    class Config:
        from_attributes = True


# ── TRUST SCORE ──
class TrustScoreOut(BaseModel):
    TrustID: int
    FreelancerID: int
    OverallScore: float
    LastCalculatedAt: Optional[datetime]

    class Config:
        from_attributes = True


class ScoreComponentOut(BaseModel):
    ComponentID: int
    FactorName: str
    Weight: float
    Value: float

    class Config:
        from_attributes = True


# ── JOB ──
class JobPostCreate(BaseModel):
    title: str = Field(..., min_length=5)
    required_trust_score: int = Field(default=0, ge=0, le=100)
    min_skill_level: str = "beginner"


class JobPostOut(BaseModel):
    JobID: int
    ClientID: int
    Title: str
    RequiredTrustScore: int
    MinSkillLevel: str
    Status: str
    CreatedAt: Optional[datetime]

    class Config:
        from_attributes = True


# ── BASELINE CHALLENGE ──
class BaselineChallenge(BaseModel):
    challenge_id: int
    title: str
    description: str
    time_limit_minutes: int
    instructions: str


# ── DEVICE FINGERPRINT ──
class DeviceFingerprintIn(BaseModel):
    fingerprint_hash: str
    ip_address: str


# ── GENERIC MESSAGE ──
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str