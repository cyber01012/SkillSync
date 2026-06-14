"""Category selection endpoints."""
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_freelancer
from app.models import Category, FreelancerProfile
from app.schemas import CategorySelectRequest, MessageResponse

router = APIRouter(prefix="/api", tags=["Categories"])


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """List all active categories grouped by domain."""
    categories = db.query(Category).filter(Category.IsActive == True).all()
    domains: dict = {}
    for cat in categories:
        if cat.Domain not in domains:
            domains[cat.Domain] = []
        domains[cat.Domain].append({
            "category_id": cat.CategoryID,
            "specialty": cat.Specialty,
            "display_name": cat.DisplayName,
        })
    return {"domains": domains}


@router.post("/me/category", response_model=MessageResponse)
def select_category(
    data: CategorySelectRequest,
    current_user=Depends(get_current_freelancer),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(
        Category.CategoryID == data.category_id,
        Category.IsActive == True,
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.CategoryID = category.CategoryID
    profile.Category = category.Specialty
    db.commit()

    return {"message": f"Category set to {category.DisplayName}"}
