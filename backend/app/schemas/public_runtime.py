"""Public runtime API schemas — sanitized recipient-facing payload only."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class PublicRuntimeMeta(BaseModel):
    public_uuid: str
    public_slug: str
    public_url: str | None = None
    published_at: datetime | None = None
    version: int = 1
    status: str = "published"
    show_create_cta: bool = True


class PublicRuntimeResponse(BaseModel):
    """Only what the cinematic runtime needs — no drafts, payments, or PII."""

    template_id: str
    experience_data: dict[str, Any]
    media_urls: list[str] = Field(default_factory=list)
    music_url: str | None = None
    meta: PublicRuntimeMeta


class PublicAnalyticsEventRequest(BaseModel):
    event: Literal[
        "experience_opened",
        "experience_completed",
        "experience_replay",
        "scene_completed",
        "watch_heartbeat",
    ]
    scene_id: str | None = None
    watch_ms: int | None = Field(default=None, ge=0, le=86_400_000)
    device_type: str | None = Field(default=None, max_length=64)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PublicAnalyticsEventResponse(BaseModel):
    ok: bool = True
