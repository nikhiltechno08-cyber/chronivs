"""Published experience ORM model — immutable public runtime record."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship
from sqlalchemy import Uuid

from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, utc_now

if TYPE_CHECKING:
    from app.models.experience import Experience


class PublishedExperience(Base, IntegerPrimaryKeyMixin):
    __tablename__ = "published_experiences"

    experience_id: Mapped[int] = mapped_column(
        ForeignKey("experiences.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    # Cryptographically secure public id — never expose DB integer ids.
    public_uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    # Short URL token (e.g. f8c3a74b) used in /e/{token}
    public_slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    public_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    template_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="published", nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    published_by: Mapped[str | None] = mapped_column(String(320), nullable=True)
    # Frozen ExperienceData snapshot — source of truth for public runtime (no HTML files).
    experience_snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    # Future: time-limited share links
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    qr_code_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    experience: Mapped[Experience] = orm_relationship("Experience", back_populates="published")
