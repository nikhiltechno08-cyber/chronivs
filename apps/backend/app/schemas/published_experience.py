"""Published experience Pydantic schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PublishedExperienceBase(BaseModel):
    public_slug: str = Field(max_length=128)
    public_url: str | None = Field(default=None, max_length=2048)
    template_id: str | None = Field(default=None, max_length=128)
    status: str = "published"
    version: int = 1
    qr_code_url: str | None = Field(default=None, max_length=2048)
    is_active: bool = True


class PublishedExperienceCreate(PublishedExperienceBase):
    experience_uuid: UUID


class PublishedExperienceUpdate(BaseModel):
    public_slug: str | None = Field(default=None, max_length=128)
    public_url: str | None = Field(default=None, max_length=2048)
    qr_code_url: str | None = Field(default=None, max_length=2048)
    is_active: bool | None = None
    status: str | None = None


class PublishedExperienceResponse(PublishedExperienceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_uuid: UUID
    published_at: datetime | None = None
    published_by: str | None = None
    experience_snapshot: dict[str, Any] | None = None
    created_at: datetime
