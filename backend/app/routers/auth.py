"""Authentication router: register, login, profile."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from typing import Any

from app.core.database import get_db
from app.core.config import get_settings
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    decode_token,
    generate_reset_token
)
from app.models import (
    User, FreelancerProfile, ClientProfile, SkillScore, TrustScore, 
    ScoreComponent, RefreshToken, BlacklistedToken, PasswordResetToken
)
from app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserOut, FreelancerProfileOut,
    TokenRefreshRequest, PasswordResetRequest, PasswordResetConfirm,
    MessageResponse
)
from app.dependencies import get_current_user, security

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new freelancer or client. Creates profile and initializes Skill DNA."""

    # Check if email exists
    existing = db.query(User).filter(User.Email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username exists
    existing_user = db.query(User).filter(User.Username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        Username=user_data.username,
        Email=user_data.email,
        PasswordHash=hashed_pw,
        Role=user_data.role,
        IsVerified=True,  # Auto-verify for demo
    )
    db.add(new_user)
    db.flush()  # Get UserID

    # Create role-specific profile
    if user_data.role == "freelancer":
        profile = FreelancerProfile(
            FreelancerID=new_user.UserID,
            DisplayName=f"{user_data.first_name} {user_data.last_name}",
            Headline="New freelancer",
            Category="General",
            AvailabilityStatus="available",
        )
        db.add(profile)
        db.flush()

        # Initialize Skill DNA with baseline scores (50/100 each)
        traits = ["Reliability", "Creativity", "Teamwork", "Communication", "Deadline Adherence", "Technical Accuracy"]
        for trait in traits:
            db.add(SkillScore(FreelancerID=new_user.UserID, TraitName=trait, Score=50))

        # Initialize Trust Score
        db.add(TrustScore(FreelancerID=new_user.UserID, OverallScore=50.0))

        # Initialize Score Components
        components = [
            ("Delivery Consistency", 0.25),
            ("Client Retention", 0.20),
            ("Communication", 0.20),
            ("Dispute History", 0.15),
            ("Challenge Performance", 0.20),
        ]
        for name, weight in components:
            db.add(ScoreComponent(FreelancerID=new_user.UserID, FactorName=name, Weight=weight, Value=50.0))

    else:  # client
        profile = ClientProfile(
            ClientID=new_user.UserID,
            CompanyName=f"{user_data.first_name}'s Company",
            IsVerified=True,
            TrustLevel="standard",
        )
        db.add(profile)

    db.commit()

    # Generate tokens
    user_data_payload = {"sub": str(new_user.UserID), "role": new_user.Role, "email": new_user.Email}
    access_token = create_access_token(data=user_data_payload)
    refresh_token_str = create_refresh_token(data=user_data_payload)

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db_refresh_token = RefreshToken(
        UserID=new_user.UserID,
        Token=refresh_token_str,
        ExpiresAt=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        role=new_user.Role,
        user_id=new_user.UserID,
        email=new_user.Email,
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and return JWT tokens."""
    user = db.query(User).filter(User.Email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.PasswordHash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate tokens
    user_data_payload = {"sub": str(user.UserID), "role": user.Role, "email": user.Email}
    access_token = create_access_token(data=user_data_payload)
    refresh_token_str = create_refresh_token(data=user_data_payload)

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db_refresh_token = RefreshToken(
        UserID=user.UserID,
        Token=refresh_token_str,
        ExpiresAt=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        role=user.Role,
        user_id=user.UserID,
        email=user.Email,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_data: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    payload = decode_token(refresh_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check in DB
    db_token = db.query(RefreshToken).filter(
        RefreshToken.Token == refresh_data.refresh_token,
        RefreshToken.IsRevoked == False,
        RefreshToken.ExpiresAt > datetime.now(timezone.utc)
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

    user = db.query(User).filter(User.UserID == db_token.UserID).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Generate new tokens
    user_data_payload = {"sub": str(user.UserID), "role": user.Role, "email": user.Email}
    new_access_token = create_access_token(data=user_data_payload)
    new_refresh_token_str = create_refresh_token(data=user_data_payload)

    # Revoke old one, store new one
    db_token.IsRevoked = True
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    new_db_token = RefreshToken(
        UserID=user.UserID,
        Token=new_refresh_token_str,
        ExpiresAt=expires_at
    )
    db.add(new_db_token)
    db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token_str,
        token_type="bearer",
        role=user.Role,
        user_id=user.UserID,
        email=user.Email,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
    auth: Any = Depends(security)
):
    """Logout current session (blacklist access token)."""
    token = auth.credentials
    db.add(BlacklistedToken(Token=token))

    # Also revoke associated refresh token if possible (optional logic)
    # For simplicity, we just blacklist the access token here.

    db.commit()
    return {"message": "Successfully logged out"}


@router.post("/logout-all", response_model=MessageResponse)
def logout_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revoke all refresh tokens for the user."""
    db.query(RefreshToken).filter(
        RefreshToken.UserID == current_user.UserID
    ).update({RefreshToken.IsRevoked: True})

    db.commit()
    return {"message": "Logged out from all devices"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset."""
    user = db.query(User).filter(User.Email == request.email).first()
    if user:
        token = generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db.add(PasswordResetToken(UserID=user.UserID, Token=token, ExpiresAt=expires_at))
        db.commit()
        # In a real app, send email here. For demo, we just return it or log it.
        print(f"DEBUG: Password reset token for {user.Email}: {token}")

    return {"message": "If that email is registered, you will receive a reset link shortly."}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using token."""
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.Token == request.token,
        PasswordResetToken.IsUsed == False,
        PasswordResetToken.ExpiresAt > datetime.now(timezone.utc)
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.UserID == reset_token.UserID).first()
    user.PasswordHash = get_password_hash(request.new_password)
    reset_token.IsUsed = True

    # Invalidate all sessions on password change
    db.query(RefreshToken).filter(RefreshToken.UserID == user.UserID).update({RefreshToken.IsRevoked: True})

    db.commit()
    return {"message": "Password successfully reset"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user


@router.get("/profile", response_model=FreelancerProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get freelancer profile with Skill DNA."""
    if current_user.Role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers have profiles")

    profile = db.query(FreelancerProfile).filter(
        FreelancerProfile.FreelancerID == current_user.UserID
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile