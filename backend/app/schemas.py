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
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    required_trust_score: int = Field(default=0, ge=0, le=100)
    min_skill_level: str = "beginner"
    required_tools: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    deadline: Optional[str] = None


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

class ApplicationWithFreelancerOut(BaseModel):
        ApplicationID: int
        JobID: int
        FreelancerID: int
        FreelancerName: Optional[str] = None
        FreelancerHeadline: Optional[str] = None
        TrustScore: Optional[float] = None
        HasBaselineDNA: Optional[bool] = False
        CoverNote: Optional[str]
        Status: str
        AppliedAt: Optional[datetime]

        class Config:
            from_attributes = True

# ── AUTH (extended) ──
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ── JOB POSTING (Member 2) ──
class JobPostDetailOut(BaseModel):
    JobID: int
    ClientID: int
    Title: str
    RequiredTrustScore: int
    MinSkillLevel: str
    Status: str
    CreatedAt: Optional[datetime]
    description: Optional[str] = None
    required_tools: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    budget_range: Optional[dict] = None
    client_name: Optional[str] = None
    client_company: Optional[str] = None
    application_count: int = 0
    has_applied: bool = False

    class Config:
        from_attributes = True


class JobWithApplicationsOut(BaseModel):
    JobID: int
    ClientID: int
    Title: str
    RequiredTrustScore: int
    MinSkillLevel: str
    Status: str
    CreatedAt: Optional[datetime]
    applications: List[ApplicationOut] = []

    class Config:
        from_attributes = True


# ── MATCHING (Member 2) ──
class FreelancerMatchOut(BaseModel):
    freelancer_id: int
    display_name: str
    headline: Optional[str]
    category: Optional[str]
    trust_score: float
    match_score: float
    has_baseline_dna: bool
    overall_dna: Optional[float] = None


class MatchResultsOut(BaseModel):
    job_id: int
    total_matches: int
    matches: List[FreelancerMatchOut]


# ── APPLICATION STATUS UPDATE (Member 2) ──
class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(accepted|rejected|pending)$")


# ── CLIENT PROFILE (Member 2) ──
class ClientProfileOut(BaseModel):
    ClientID: int
    CompanyName: Optional[str]
    IndustryID: Optional[int]
    IsVerified: bool
    TrustLevel: str
    email: Optional[str] = None
    total_jobs_posted: int = 0
    total_applications_received: int = 0

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════
# MEMBER 3 — CONTRACTS + VPO + FRAUD
# ═══════════════════════════════════════════════════════════════

# ── CONTRACTS ──
class ContractCreate(BaseModel):
    job_id: int
    freelancer_id: int
    total_amount: float = Field(..., gt=0)
    milestones: Optional[List[dict]] = []


class ContractOut(BaseModel):
    ContractID: int
    JobID: int
    FreelancerID: int
    ClientID: int
    TotalAmount: float
    Status: str
    CreatedAt: Optional[datetime]
    job_title: Optional[str] = None
    freelancer_name: Optional[str] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True


class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    amount: float = Field(..., gt=0)
    due_date: Optional[str] = None


class MilestoneOut(BaseModel):
    MilestoneID: int
    ContractID: int
    Title: str
    Amount: float
    DueDate: Optional[datetime]
    Status: str
    ApprovedAt: Optional[datetime]

    class Config:
        from_attributes = True


class MilestoneApproveRequest(BaseModel):
    milestone_id: int


class EscrowStatusOut(BaseModel):
    contract_id: int
    total_amount: float
    escrow_balance: float
    milestones_total: float
    released_amount: float
    pending_amount: float


class PaymentEventOut(BaseModel):
    EventID: int
    ContractID: int
    Amount: float
    EventType: str
    ProcessedAt: Optional[datetime]
    EscrowBalance: float

    class Config:
        from_attributes = True


# ── VPO / PROJECT OFFICE ──
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = ""
    status: str = "todo"
    assignee_id: Optional[int] = None
    due_date: Optional[str] = None


class TaskOut(BaseModel):
    task_id: str
    contract_id: int
    title: str
    description: str
    status: str
    assignee_id: Optional[int]
    created_at: str
    due_date: Optional[str]


class MessageSend(BaseModel):
    contract_id: int
    body: str = Field(..., min_length=1)
    attachments: Optional[List[str]] = []


class MessageOut(BaseModel):
    msg_id: str
    contract_id: int
    sender_id: int
    sender_name: str
    sender_role: str
    body: str
    attachments: List[str]
    sent_at: str
    read_by: List[int]


class SubmissionCreate(BaseModel):
    contract_id: int
    milestone_id: Optional[int] = None
    text_content: str = ""
    files: Optional[List[dict]] = []


class SubmissionOut(BaseModel):
    submission_id: str
    contract_id: int
    milestone_id: Optional[int]
    freelancer_id: int
    version: int
    files: List[dict]
    text_content: str
    submitted_at: str
    ai_score: Optional[float] = None
    fraud_flags: Optional[List[dict]] = []


class FraudFlagOut(BaseModel):
    flag_id: str
    submission_id: str
    detection_type: str
    confidence_score: float
    evidence: dict
    flagged_at: str
    status: str


# ── FRAUD DETECTION ──
class FraudDetectionResult(BaseModel):
    submission_id: str
    is_flagged: bool
    confidence_score: float
    detection_type: str
    evidence: dict
    recommendation: str


# ── DISPUTES ──
class DisputeCreate(BaseModel):
    contract_id: int
    description: str = Field(..., min_length=10)
    raised_by: int


class DisputeOut(BaseModel):
    DisputeID: int
    ContractID: int
    RaisedBy: int
    Description: str
    Status: str
    ResolvedAt: Optional[datetime]

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════
# MEMBER 4 — PAYMENTS + TRUST SCORE + ANALYTICS
# ═══════════════════════════════════════════════════════════════

# ── TRUST SCORE ──
class TrustScoreHistoryOut(BaseModel):
    HistoryID: int
    FreelancerID: int
    OldScore: float
    NewScore: float
    ChangedAt: Optional[datetime]
    Reason: Optional[str]

    class Config:
        from_attributes = True


class TrustScoreUpdateRequest(BaseModel):
    freelancer_id: int
    new_score: float = Field(..., ge=0, le=100)
    reason: Optional[str] = "Manual update"


# ── ANALYTICS ──
class PlatformKPIsOut(BaseModel):
    total_users: int
    total_freelancers: int
    total_clients: int
    total_jobs: int
    total_contracts: int
    total_revenue: float
    avg_trust_score: float
    completion_rate: float
    top_freelancers: List[dict]
    recent_payments: List[dict]
    monthly_growth: List[dict]


class FreelancerRankingOut(BaseModel):
    rank: int
    freelancer_id: int
    display_name: str
    trust_score: float
    completed_contracts: int
    total_earnings: float
    category: Optional[str]


class JobAnalyticsOut(BaseModel):
    job_id: int
    title: str
    total_applications: int
    avg_trust_score: float
    top_matches: int
    status: str


# ── PAYMENTS ──
class PaymentReleaseRequest(BaseModel):
    milestone_id: int
    contract_id: int


class PaymentStatusOut(BaseModel):
    payment_id: str
    milestone_id: int
    contract_id: int
    amount: float
    status: str
    released_at: Optional[str]
    released_by: Optional[int]
    transaction_hash: Optional[str]

    