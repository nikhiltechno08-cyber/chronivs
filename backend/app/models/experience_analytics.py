"""Analytics events for public experience runtime."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, utc_now


class ExperienceAnalyticsEvent(Base, IntegerPrimaryKeyMixin):
    __tablename__ = "experience_analytics_events"

    uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    published_experience_id: Mapped[int] = mapped_column(
        ForeignKey("published_experiences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    public_slug: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    event: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    scene_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    watch_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # Reserved for future geo enrichment
    country: Mapped[str | None] = mapped_column(String(8), nullable=True)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )
