"""Profile endpoints for freelancers."""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_freelancer
from app.models import FreelancerProfile, Category, SkillScore, DNASnapshot, ChallengeResult, User
from app.schemas import ProfileOut, ProfileUpdateRequest, ProfileCompleteStatus

router = APIRouter(prefix="/api/me", tags=["Profile"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def _build_profile_out(profile: FreelancerProfile, db: Session, user: User) -> ProfileOut:
    category_display = None
    if profile.CategoryID:
        cat = db.query(Category).filter(Category.CategoryID == profile.CategoryID).first()
        if cat:
            category_display = cat.DisplayName

    completed = db.query(ChallengeResult).filter(
        ChallengeResult.FreelancerID == profile.FreelancerID
    ).count()

    overall_dna = None
    latest = db.query(DNASnapshot).filter(
        DNASnapshot.FreelancerID == profile.FreelancerID
    ).order_by(DNASnapshot.TakenAt.desc()).first()
    if latest:
        import json
        try:
            data = json.loads(latest.SnapshotData)
            overall_dna = data.get("overall")
        except (json.JSONDecodeError, TypeError):
            pass

    return ProfileOut(
        FreelancerID=profile.FreelancerID,
        DisplayName=profile.DisplayName,
        Headline=profile.Headline,
        Bio=profile.Bio,
        ProfilePhotoURL=profile.ProfilePhotoURL,
        CategoryID=profile.CategoryID,
        Category=profile.Category,
        HasBaselineDNA=bool(profile.HasBaselineDNA),
        category_display_name=category_display,
        email=user.Email,
        challenges_completed=completed,
        challenges_total=4,
        overall_dna=overall_dna,
    )


@router.get("/profile", response_model=ProfileOut)
def get_my_profile(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _build_profile_out(profile, db, current_user)


@router.put("/profile", response_model=ProfileOut)
def update_my_profile(
    data: ProfileUpdateRequest,
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.display_name is not None:
        profile.DisplayName = data.display_name
    if data.headline is not None:
        profile.Headline = data.headline
    if data.bio is not None:
        profile.Bio = data.bio

    db.commit()
    db.refresh(profile)
    return _build_profile_out(profile, db, current_user)


@router.post("/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"{current_user.UserID}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    filepath.write_bytes(content)

    url = f"/uploads/{filename}"
    profile.ProfilePhotoURL = url
    db.commit()

    return {"url": url, "message": "Photo uploaded successfully"}


@router.get("/profile/status", response_model=ProfileCompleteStatus)
def get_profile_status(
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    missing = []
    if not profile.DisplayName:
        missing.append("display_name")
    if not profile.CategoryID:
        missing.append("category")
    if not profile.HasBaselineDNA:
        missing.append("baseline_dna")

    has_category = bool(profile.CategoryID)
    has_dna = bool(profile.HasBaselineDNA)
    is_complete = has_category and has_dna and bool(profile.DisplayName)

    return ProfileCompleteStatus(
        is_complete=is_complete,
        has_category=has_category,
        has_baseline_dna=has_dna,
        missing=missing,
    )
