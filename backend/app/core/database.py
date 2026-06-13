"""Database connections: SQL Server (SQLAlchemy) + MongoDB (PyMongo)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient
from app.core.config import get_settings

settings = get_settings()

# ── SQL Server ──
engine = create_engine(
    settings.sql_server_connection_string,
    echo=False,  # Set True for SQL logging
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for SQL Server sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── MongoDB ──
mongo_client = MongoClient(settings.mongodb_url)
mongo_db = mongo_client[settings.mongodb_db]


def get_mongo_db():
    """FastAPI dependency for MongoDB."""
    return mongo_db


def get_mongo_client():
    """Get raw MongoDB client (for seeding)."""
    return mongo_client