"""Publish API schemas — create publish + public runtime payload."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class PublishResponse(BaseModel):
    published: bool = True
    public_url: str
    public_uuid: str
    public_slug: str
    published_at: datetime
    status: str = "PUBLISHED"
    version: int = 1
    template_id: str | None = None
    experience_id: UUID = Field(description="Internal experience UUID (not DB integer)")


class PublicRuntimePayload(BaseModel):
    """Payload for the public viewer — Template + ExperienceData + media URLs."""

    public_uuid: str
    public_slug: str
    public_url: str | None = None
    template_id: str
    version: int
    published_at: datetime | None = None
    status: str
    experience_data: dict[str, Any]
    # Convenience flat media URLs for runtime (from frozen snapshot)
    media_urls: list[str] = Field(default_factory=list)
