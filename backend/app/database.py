import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("agnes.database")
Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://") and not db_url.startswith("postgresql+psycopg2://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    try:
        if "postgresql" in db_url:
            eng = create_engine(db_url, pool_pre_ping=True)
            with eng.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database!")
            return eng
    except Exception as e:
        logger.warning(
            f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database for resilient offline/local execution."
        )
    
    # SQLite fallback
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "agnes_learning.db")
    fallback_url = f"sqlite:///{sqlite_path}"
    logger.info(f"Using SQLite database at {sqlite_path}")
    return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
