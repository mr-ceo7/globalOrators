"""
Authentication Pydantic Schemas
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator, model_validator


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    avatar: Optional[str] = None
    role: Optional[str] = "speaker"
    coach_invite_code: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    credential: str
    role: Optional[str] = "speaker" # "coach" or "speaker"
    client_id: Optional[str] = None
    coach_invite_code: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar: str
    is_active: bool
    # Computed server-side so the frontend never hard-codes who the head coach is.
    is_head_coach: bool = False

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def _compute_head_coach(self):
        from app.config import settings
        self.is_head_coach = settings.is_head_coach(self.id, self.email, self.role)
        return self


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SendOtpRequest(BaseModel):
    email: str
    redirect_url: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email address format")
        return clean


class VerifyOtpRequest(BaseModel):
    email: str
    code: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email address format")
        return clean


class VerifyMagicLinkRequest(BaseModel):
    token: str
    email: Optional[str] = None


class OtpResponse(BaseModel):
    status: str
    email: str
    message: str
    magic_link: Optional[str] = None


class CheckEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email address format")
        return clean


class CheckEmailResponse(BaseModel):
    email: str
    exists: bool
    auth_method: str  # "password", "google", "both", "none"
    role: Optional[str] = None
