"""Experience media ORM model — Cloudinary-backed references."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.common.enums import MediaType, MediaUploadStatus
from app.common.utils import utc_now
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.experience import Experience


class ExperienceMedia(Base, IntegerPrimaryKeyMixin):
    __tablename__ = "experience_media"

    uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    # Nullable so uploads can be stored before an experience is linked.
    experience_id: Mapped[int | None] = mapped_column(
        ForeignKey("experiences.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    media_type: Mapped[MediaType] = mapped_column(
        Enum(
            MediaType,
            name="media_type",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    placeholder_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    # Kept for backward compatibility; mirrors secure_url after Cloudinary upload.
    file_url: Mapped[str] = mapped_column(String(2048), nullable=False, default="")
    upload_status: Mapped[MediaUploadStatus] = mapped_column(
        Enum(
            MediaUploadStatus,
            name="media_upload_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=MediaUploadStatus.PLACEHOLDER,
        nullable=False,
    )
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cloudinary_public_id: Mapped[str | None] = mapped_column(String(512), nullable=True)
    secure_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    format: Mapped[str | None] = mapped_column(String(32), nullable=True)
    byte_size: Mapped[int | None] = mapped_column("bytes", Integer, nullable=True)
    resource_type: Mapped[str | None] = mapped_column(String(32), nullable=True, default="image")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    experience: Mapped[Experience | None] = orm_relationship("Experience", back_populates="media")
