"""Experience ORM model — central Chronivs object for all future phases."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.common.enums import ExperienceStatus
from app.common.utils import utc_now
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.email_log import EmailLog
    from app.models.experience_media import ExperienceMedia
    from app.models.payment import Payment
    from app.models.published_experience import PublishedExperience
    from app.models.user import User


class Experience(Base, IntegerPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "experiences"

    uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    # Nullable for guest checkout; auth can link later.
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    template_slug: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    template_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    occasion: Mapped[str | None] = mapped_column(String(128), nullable=True)
    relationship: Mapped[str | None] = mapped_column(String(128), nullable=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    customer_name: Mapped[str | None] = mapped_column(String(60), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(320), nullable=True, index=True)
    customer_mobile: Mapped[str | None] = mapped_column(String(15), nullable=True)

    status: Mapped[ExperienceStatus] = mapped_column(
        Enum(
            ExperienceStatus,
            name="experience_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=ExperienceStatus.DRAFT,
        nullable=False,
        index=True,
    )

    preview_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    published_version: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Structured ExperienceData (sections) — not arbitrary free-form blobs.
    experience_data: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_by: Mapped[str | None] = mapped_column(String(320), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    user: Mapped[User | None] = orm_relationship("User", back_populates="experiences")
    media: Mapped[list[ExperienceMedia]] = orm_relationship(
        "ExperienceMedia",
        back_populates="experience",
        cascade="all, delete-orphan",
        order_by="ExperienceMedia.display_order",
    )
    payment: Mapped[Payment | None] = orm_relationship(
        "Payment",
        back_populates="experience",
        uselist=False,
        cascade="all, delete-orphan",
    )
    published: Mapped[PublishedExperience | None] = orm_relationship(
        "PublishedExperience",
        back_populates="experience",
        uselist=False,
        cascade="all, delete-orphan",
    )
    email_logs: Mapped[list[EmailLog]] = orm_relationship(
        "EmailLog",
        back_populates="experience",
        cascade="all, delete-orphan",
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def touch_soft_delete(self) -> None:
        self.deleted_at = utc_now()
        self.status = ExperienceStatus.ARCHIVED
