"""Authentication request / response schemas."""

from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

_PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,128}$")


class RegisterRequest(BaseModel):
    """User registration payload."""

    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name is required")
        return cleaned

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        if not _PASSWORD_PATTERN.match(value):
            raise ValueError(
                "Password must be at least 8 characters and include at least one letter and one number"
            )
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> RegisterRequest:
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    """User login payload."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    """Refresh-token rotation payload."""

    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseModel):
    """Optional refresh token to revoke on logout."""

    refresh_token: str | None = None


class AuthUserResponse(BaseModel):
    """Public user profile returned by auth endpoints (never includes password)."""

    model_config = ConfigDict(from_attributes=True)

    uuid: UUID
    name: str | None = None
    email: EmailStr
    avatar: str | None = None
    provider: str | None = None
    is_verified: bool
    is_active: bool
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime


class TokenPairResponse(BaseModel):
    """Access + refresh token pair."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthLoginResponse(BaseModel):
    """Login / refresh success payload."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class AuthRegisterResponse(BaseModel):
    """Registration success payload."""

    user: AuthUserResponse
    message: str = "Account created successfully"


class AuthMessageResponse(BaseModel):
    """Generic auth message."""

    message: str
