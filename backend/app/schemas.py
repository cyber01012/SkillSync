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
    ChallengeID: str
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


# ── CATEGORIES ──
class CategoryOut(BaseModel):
    CategoryID: int
    Domain: str
    Specialty: str
    DisplayName: str
    IsActive: bool = True

    class Config:
        from_attributes = True


class CategorySelectRequest(BaseModel):
    category_id: int


class CategoriesGroupedResponse(BaseModel):
    domains: dict


# ── PROFILE ──
class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)


class ProfileOut(BaseModel):
    FreelancerID: int
    DisplayName: Optional[str]
    Headline: Optional[str]
    Bio: Optional[str]
    ProfilePhotoURL: Optional[str]
    CategoryID: Optional[int]
    Category: Optional[str]
    HasBaselineDNA: bool = False
    category_display_name: Optional[str] = None
    email: Optional[str] = None
    challenges_completed: int = 0
    challenges_total: int = 4
    overall_dna: Optional[float] = None

    class Config:
        from_attributes = True


class ProfileCompleteStatus(BaseModel):
    is_complete: bool
    has_category: bool
    has_baseline_dna: bool
    missing: List[str] = []


# ── BASELINE (extended) ──
class BaselineChallengeOut(BaseModel):
    challenge_id: str
    title: str
    description: str
    time_limit_minutes: int
    starter_code: str
    test_cases: List[dict]
    language: str = "python"
    difficulty: str = "beginner"
    category: str = ""
    all_completed: bool = False


class BaselineStartRequest(BaseModel):
    challenge_id: str


class BaselineStartResponse(BaseModel):
    session_id: str
    challenge_id: str
    started_at: str


class BaselineStepRequest(BaseModel):
    session_id: str
    timestamp: str
    action: str
    content: Optional[str] = ""
    file: Optional[str] = "main.py"
    cursor_line: Optional[int] = 0
    cursor_col: Optional[int] = 0


class BaselineRunRequest(BaseModel):
    session_id: str
    code: str
    file: str = "main.py"


class BaselineRunResponse(BaseModel):
    passed: int
    failed: int
    total: int
    details: List[dict]
    stdout: Optional[str] = ""
    stderr: Optional[str] = ""


class BaselineSubmitRequest(BaseModel):
    session_id: str
    code: str
    duration_ms: int
    on_time: bool = True
    overtime_minutes: int = 0


class BaselineSubmitResponse(BaseModel):
    session_id: str
    status: str
    message: str


# ── DNA (extended) ──
class DNAStatusOut(BaseModel):
    has_baseline_dna: bool
    overall_dna: Optional[float] = None


class DNAActivityItem(BaseModel):
    type: str
    title: str
    description: str
    timestamp: Optional[datetime] = None
    score_change: Optional[float] = None


# ── JOBS ──
class JobApplyRequest(BaseModel):
    cover_note: Optional[str] = ""


class ApplicationOut(BaseModel):
    ApplicationID: int
    JobID: int
    FreelancerID: int
    CoverNote: Optional[str]
    Status: str
    AppliedAt: Optional[datetime]

    class Config:
        from_attributes = True


# ── AUTH (extended) ──
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)