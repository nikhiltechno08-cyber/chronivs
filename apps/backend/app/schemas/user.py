"""User Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr
    avatar: str | None = Field(default=None, max_length=1024)
    provider: str | None = Field(default=None, max_length=64)


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    avatar: str | None = Field(default=None, max_length=1024)
    provider: str | None = Field(default=None, max_length=64)


class UserResponse(UserBase):
    """Public user representation — never includes password_hash."""

    model_config = ConfigDict(from_attributes=True)

    uuid: UUID
    is_verified: bool = False
    is_active: bool = True
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime
