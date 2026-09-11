"""
Inquiry Schema with Server-side Input Sanitization & Validation
"""

import html
import re
from typing import Optional
from pydantic import Field, field_validator
from app.schemas.common import CamelModel

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
SCRIPT_TAGS_REGEX = re.compile(r"<(script|style|iframe)[^>]*>[\s\S]*?</\1>", re.IGNORECASE)
HTML_TAGS_REGEX = re.compile(r"<[^>]+>")


def sanitize_input_text(val: str, max_len: int) -> str:
    """Strip script blocks, strip remaining HTML tags, normalize whitespace, truncate, and escape."""
    if not val:
        return ""
    # Strip script, style, and iframe tags along with their inner contents
    cleaned = SCRIPT_TAGS_REGEX.sub("", val)
    # Strip any remaining tags
    cleaned = HTML_TAGS_REGEX.sub("", cleaned)
    # Normalize multiple whitespace chars to single spaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Truncate to maximum allowed length
    cleaned = cleaned[:max_len]
    # Escape HTML special characters
    return html.escape(cleaned)


class InquiryCreate(CamelModel):
    organization: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=254)
    branch: str = Field(default="Academy", max_length=50)
    focus: str = Field(..., min_length=2, max_length=120)
    message: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("organization")
    @classmethod
    def validate_and_sanitize_organization(cls, v: str) -> str:
        clean = sanitize_input_text(v, 120)
        if len(clean) < 2:
            raise ValueError("Organization name must contain at least 2 valid characters.")
        return clean

    @field_validator("email")
    @classmethod
    def validate_and_sanitize_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean) or len(clean) > 254:
            raise ValueError("Invalid email address format.")
        return clean

    @field_validator("branch")
    @classmethod
    def validate_and_sanitize_branch(cls, v: str) -> str:
        clean = sanitize_input_text(v, 50)
        if "Foundation" in clean:
            return "Foundation"
        return "Academy"

    @field_validator("focus")
    @classmethod
    def validate_and_sanitize_focus(cls, v: str) -> str:
        clean = sanitize_input_text(v, 120)
        if not clean:
            raise ValueError("Collaboration focus is required.")
        return clean

    @field_validator("message")
    @classmethod
    def validate_and_sanitize_message(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        # Remove malicious tags and normalize
        cleaned = SCRIPT_TAGS_REGEX.sub("", v)
        cleaned = HTML_TAGS_REGEX.sub("", cleaned).strip()
        cleaned = cleaned[:1000]
        escaped = html.escape(cleaned)
        return escaped or None


class InquiryResponse(CamelModel):
    status: str
    inquiry_id: str
    organization: str
    email: str
    branch: str
    focus: str
    message: str
    created_at: str

