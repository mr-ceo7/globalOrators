"""
Application Configuration and Settings
"""

import os
from typing import List, Set, Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_default_db_path = os.path.join(_backend_dir, "nubianfit.db")

INSECURE_SECRET_KEYS: Set[str] = {
    "globalorators-jwt-production-signing-secret-key-2026",
    "secret",
    "changeme",
    "your-secret-key",
    "jwt-secret-key",
}

INSECURE_COACH_PASSWORDS: Set[str] = {
    "Coach@123",
    "password",
    "admin123",
    "12345678",
}

INSECURE_INVITE_CODES: Set[str] = {
    "globalorators-coach-invite-2026",
    "invite",
    "coach-invite",
}

class Settings(BaseSettings):
    PROJECT_NAME: str = "global Orators Speech & Debate Coaching Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment & Testing
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    TESTING: bool = os.getenv("TESTING", "false").lower() in ("true", "1")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{_default_db_path}")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "globalorators-jwt-production-signing-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Administrator Bootstrapping (Audit & Controlled Provisioning)
    BOOTSTRAP_INITIAL_ADMIN: bool = os.getenv("BOOTSTRAP_INITIAL_ADMIN", "false").lower() in ("true", "1")
    DEFAULT_COACH_NAME: str = os.getenv("DEFAULT_COACH_NAME", "Head Coach Qassim")
    DEFAULT_COACH_EMAIL: str = os.getenv("DEFAULT_COACH_EMAIL", "kassimmusa322@gmail.com")
    DEFAULT_COACH_PASSWORD: str = os.getenv("DEFAULT_COACH_PASSWORD", "Coach@123")
    COACH_INVITE_CODE: str = os.getenv("COACH_INVITE_CODE", "globalorators-coach-invite-2026")

    def is_head_coach(self, user_id: Optional[str], email: Optional[str], role: Optional[str] = "coach") -> bool:
        """The head coach is coach-1 or the DEFAULT_COACH_EMAIL account (same rule as data access)."""
        if role != "coach":
            return False
        return user_id == "coach-1" or bool(email) and email.strip().lower() == self.DEFAULT_COACH_EMAIL.strip().lower()

    # Durable Storage Configuration (Local Disk or Private S3/Object Storage)
    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local")  # "local" or "s3"
    STORAGE_LOCAL_ROOT: str = os.getenv("STORAGE_LOCAL_ROOT", os.path.join(_backend_dir, "uploads"))
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    S3_ACCESS_KEY_ID: str = os.getenv("S3_ACCESS_KEY_ID", "")
    S3_SECRET_ACCESS_KEY: str = os.getenv("S3_SECRET_ACCESS_KEY", "")
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "")
    STORAGE_MAX_TOTAL_BYTES: int = int(os.getenv("STORAGE_MAX_TOTAL_BYTES", str(10 * 1024 * 1024 * 1024)))  # 10 GB quota

    # Google OAuth / One Tap
    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID", 
        "664033502342-9sijfg71v3c0i0riah1hhhgdufalfvk5.apps.googleusercontent.com"
    )
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # SMTP Email Configuration (Passwordless Speaker OTP Verification)
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "auth@globaloratorsproject.com")
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY", None)
    FORWARDING_EMAIL: str = os.getenv("FORWARDING_EMAIL", "kassimmusa322@gmail.com")
    RESEND_WEBHOOK_SECRET: Optional[str] = os.getenv("RESEND_WEBHOOK_SECRET", None)

    # Invoicing: the shared payment backend and the Global Orators company key for its admin API.
    PAYMENT_BACKEND_URL: str = os.getenv("PAYMENT_BACKEND_URL", "https://uon-smart-backend.onrender.com")
    INVOICE_ADMIN_KEY: str = os.getenv("INVOICE_ADMIN_KEY", "")
    # Server-side key for AI invoice drafting (never shipped to the browser).
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Shared token the Jitsi tunnel watchdog sends to update the live-room domain.
    # Leave empty to disable remote domain updates.
    JITSI_UPDATE_TOKEN: str = os.getenv("JITSI_UPDATE_TOKEN", "")

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

    APP_URL: str = os.getenv("APP_URL", "https://globaloratorsproject.com")

    model_config = SettingsConfigDict(
        env_file=(os.path.join(_backend_dir, ".env"), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode="after")
    def validate_production_secrets(self):
        """
        Fail closed in production mode:
        If ENVIRONMENT == 'production' and not TESTING, refuse to start if
        SECRET_KEY, DEFAULT_COACH_PASSWORD, or COACH_INVITE_CODE are missing,
        weak, or set to insecure fallback values.
        """
        if self.ENVIRONMENT == "production" and not self.TESTING:
            if not self.SECRET_KEY or self.SECRET_KEY in INSECURE_SECRET_KEYS or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production, SECRET_KEY must be explicitly "
                    "configured with a strong secret (at least 32 characters) and must not use insecure default fallbacks."
                )
            if not self.DEFAULT_COACH_PASSWORD or self.DEFAULT_COACH_PASSWORD in INSECURE_COACH_PASSWORDS or len(self.DEFAULT_COACH_PASSWORD) < 8:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production, DEFAULT_COACH_PASSWORD must be "
                    "configured with a strong password (at least 8 characters) and must not use insecure default fallbacks."
                )
            if not self.COACH_INVITE_CODE or self.COACH_INVITE_CODE in INSECURE_INVITE_CODES or len(self.COACH_INVITE_CODE) < 16:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production, COACH_INVITE_CODE must be "
                    "configured with a strong unique invite code (at least 16 characters) and must not use insecure default fallbacks."
                )
            if not self.SMTP_USERNAME or not self.SMTP_PASSWORD:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: In production, SMTP_USERNAME and SMTP_PASSWORD "
                    "must be configured for secure email OTP delivery."
                )
        return self


settings = Settings()
