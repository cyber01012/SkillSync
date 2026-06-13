from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "Users"
    UserID = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String(50), unique=True, nullable=False)
    Email = Column(String(255), unique=True, nullable=False)
    PasswordHash = Column(String(255), nullable=False)
    Role = Column(String(20), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsVerified = Column(Boolean, default=False)

class FreelancerProfile(Base):
    __tablename__ = "FreelancerProfiles"
    FreelancerID = Column(Integer, ForeignKey("Users.UserID"), primary_key=True)
    DisplayName = Column(String(100))
    Headline = Column(String(255))
    Category = Column(String(50))
    AvailabilityStatus = Column(String(20), default="available")

class ClientProfile(Base):
    __tablename__ = "ClientProfiles"
    ClientID = Column(Integer, ForeignKey("Users.UserID"), primary_key=True)
    CompanyName = Column(String(100))
    IndustryID = Column(Integer)
    IsVerified = Column(Boolean, default=False)
    TrustLevel = Column(String(20), default="standard")

class SkillScore(Base):
    __tablename__ = "SkillScores"
    ScoreID = Column(Integer, primary_key=True, autoincrement=True)
    FreelancerID = Column(Integer, ForeignKey("FreelancerProfiles.FreelancerID"))
    TraitName = Column(String(50))
    Score = Column(Integer, default=50)
    UpdatedAt = Column(DateTime, default=datetime.utcnow)

class TrustScore(Base):
    __tablename__ = "TrustScores"
    TrustID = Column(Integer, primary_key=True, autoincrement=True)
    FreelancerID = Column(Integer, ForeignKey("FreelancerProfiles.FreelancerID"), unique=True)
    OverallScore = Column(Float, default=50.0)
    LastCalculatedAt = Column(DateTime, default=datetime.utcnow)

class ScoreComponent(Base):
    __tablename__ = "ScoreComponents"
    ComponentID = Column(Integer, primary_key=True, autoincrement=True)
    FreelancerID = Column(Integer, ForeignKey("FreelancerProfiles.FreelancerID"))
    FactorName = Column(String(50))
    Weight = Column(Float, default=0.2)
    Value = Column(Float, default=50.0)
    UpdatedAt = Column(DateTime, default=datetime.utcnow)

class ChallengeResult(Base):
    __tablename__ = "ChallengeResults"
    ResultID = Column(Integer, primary_key=True, autoincrement=True)
    FreelancerID = Column(Integer, ForeignKey("FreelancerProfiles.FreelancerID"))
    ChallengeID = Column(Integer)
    Score = Column(Integer)
    TimeTaken = Column(Integer)
    CompletedAt = Column(DateTime, default=datetime.utcnow)

class DNASnapshot(Base):
    __tablename__ = "DNASnapshots"
    SnapshotID = Column(Integer, primary_key=True, autoincrement=True)
    FreelancerID = Column(Integer, ForeignKey("FreelancerProfiles.FreelancerID"))
    SnapshotData = Column(Text)
    TakenAt = Column(DateTime, default=datetime.utcnow)

class RefreshToken(Base):
    __tablename__ = "RefreshTokens"
    ID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), nullable=False)
    Token = Column(String(512), unique=True, nullable=False)
    ExpiresAt = Column(DateTime, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsRevoked = Column(Boolean, default=False)

class BlacklistedToken(Base):
    __tablename__ = "BlacklistedTokens"
    ID = Column(Integer, primary_key=True, autoincrement=True)
    Token = Column(String(512), unique=True, nullable=False)
    BlacklistedAt = Column(DateTime, default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "PasswordResetTokens"
    ID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), nullable=False)
    Token = Column(String(512), unique=True, nullable=False)
    ExpiresAt = Column(DateTime, nullable=False)
    IsUsed = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)