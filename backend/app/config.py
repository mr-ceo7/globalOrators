"""
Application Configuration and Settings
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_default_db_path = os.path.join(_backend_dir, "nubianfit.db")

class Settings(BaseSettings):
    PROJECT_NAME: str = "global Orators Speech & Debate Coaching Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment & Testing
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    TESTING: bool = os.getenv("TESTING", "false").lower() in ("true", "1")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{_default_db_path}")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "globalorators-jwt-production-signing-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Default Coach Account (auto-seeded)
    DEFAULT_COACH_NAME: str = os.getenv("DEFAULT_COACH_NAME", "Head Coach Qassim")
    DEFAULT_COACH_EMAIL: str = os.getenv("DEFAULT_COACH_EMAIL", "coach@globalorators.com")
    DEFAULT_COACH_PASSWORD: str = os.getenv("DEFAULT_COACH_PASSWORD", "Coach@123")
    COACH_INVITE_CODE: str = os.getenv("COACH_INVITE_CODE", "globalorators-coach-invite-2026")
    
    # Google OAuth / One Tap
    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID", 
        "664033502342-9sijfg71v3c0i0riah1hhhgdufalfvk5.apps.googleusercontent.com"
    )
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # CORS: Explicit allowed origins (no wildcard with credentials)
    CORS_ORIGINS: List[str] = [
        "https://globaloratorsproject.com",
        "https://app.globaloratorsproject.com",
        "https://coach.globaloratorsproject.com",
        "https://onboard.globaloratorsproject.com",
        "https://meet.globalorators.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
