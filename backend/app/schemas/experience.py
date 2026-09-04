"""Experience Pydantic schemas — CRUD + structured ExperienceData."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.common.enums import ExperienceStatus
from app.schemas.experience_data import ExperienceData


class ExperienceCreateRequest(BaseModel):
    """Create a draft or checkout-linked experience (guest-friendly)."""

    template_slug: str | None = Field(default=None, max_length=128)
    template_name: str | None = Field(default=None, max_length=128)
    occasion: str | None = Field(default=None, max_length=128)
    relationship: str | None = Field(default=None, max_length=128)
    title: str | None = Field(default=None, max_length=255)
    customer_name: str | None = Field(default=None, min_length=2, max_length=60)
    customer_email: EmailStr | None = None
    customer_mobile: str | None = Field(default=None, max_length=15)
    status: ExperienceStatus = ExperienceStatus.DRAFT
    experience_data: ExperienceData | None = None
    uuid: UUID | None = None
    user_uuid: UUID | None = None


class ExperienceUpdateRequest(BaseModel):
    template_slug: str | None = Field(default=None, max_length=128)
    template_name: str | None = Field(default=None, max_length=128)
    occasion: str | None = Field(default=None, max_length=128)
    relationship: str | None = Field(default=None, max_length=128)
    title: str | None = Field(default=None, max_length=255)
    customer_name: str | None = Field(default=None, min_length=2, max_length=60)
    customer_email: EmailStr | None = None
    customer_mobile: str | None = Field(default=None, max_length=15)
    status: ExperienceStatus | None = None
    experience_data: ExperienceData | None = None
    preview_version: int | None = Field(default=None, ge=1)
    published_version: int | None = Field(default=None, ge=1)
    published_at: datetime | None = None


class ExperienceSectionPatchRequest(BaseModel):
    """Autosave-ready partial update for one ExperienceData section."""

    section: str
    data: dict


class ExperienceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: UUID
    template_slug: str | None = None
    template_name: str | None = None
    occasion: str | None = None
    relationship: str | None = None
    title: str | None = None
    customer_name: str | None = None
    customer_email: str | None = None
    customer_mobile: str | None = None
    status: ExperienceStatus
    preview_version: int
    published_version: int | None = None
    experience_data: ExperienceData
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    user_uuid: UUID | None = None

    # Convenience aliases for draft clients (Phase 4.3)
    @property
    def id(self) -> UUID:
        return self.uuid


class ExperienceDraftCreateResponse(BaseModel):
    """Compact create-draft response for studio persistence."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    status: ExperienceStatus
    createdAt: datetime
    updatedAt: datetime
    preview_version: int = 1
    experience_data: ExperienceData


class ExperienceListResponse(BaseModel):
    items: list[ExperienceResponse]
    total: int
    page: int = 1
    page_size: int = 20


# Backward-compatible aliases for older imports.
class ExperienceBase(BaseModel):
    occasion: str | None = None
    relationship: str | None = None
    template_name: str | None = None
    title: str | None = None
    status: ExperienceStatus = ExperienceStatus.DRAFT


class ExperienceCreate(ExperienceCreateRequest):
    pass


class ExperienceUpdate(ExperienceUpdateRequest):
    pass
