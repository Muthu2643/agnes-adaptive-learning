import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Agnes 3.0 Flash - Agentic Adaptive Learning Platform"
    API_V1_STR: str = "/api/v1"
    
    # Agnes AI API
    AGNES_API_BASE: str = os.getenv("AGNES_API_BASE", "https://apihub.agnes-ai.com/v1")
    AGNES_API_KEY: str = os.getenv("AGNES_API_KEY", "")
    AGNES_MODEL: str = os.getenv("AGNES_MODEL", "agnes-3.0-flash")
    AGNES_IMAGE_MODEL: str = os.getenv("AGNES_IMAGE_MODEL", "agnes-image-2.5-flash")
    
    # Database (PostgreSQL with SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/agnes_learning"
    )
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
