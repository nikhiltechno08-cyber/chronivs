"""Email log ORM model — delivery audit trail."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.common.enums import EmailLogStatus
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.experience import Experience


class EmailLog(Base, IntegerPrimaryKeyMixin):
    __tablename__ = "email_logs"

    experience_id: Mapped[int] = mapped_column(
        ForeignKey("experiences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Spec alias: recipient_email
    recipient: Mapped[str] = mapped_column(String(320), nullable=False)
    subject: Mapped[str] = mapped_column(String(512), nullable=False)
    provider: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[EmailLogStatus] = mapped_column(
        Enum(
            EmailLogStatus,
            name="email_log_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=EmailLogStatus.PENDING,
        nullable=False,
        index=True,
    )
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    message_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Future: receipt, reminder, anniversary_reminder, thank_you, referral
    email_type: Mapped[str] = mapped_column(
        String(64),
        default="experience_ready",
        nullable=False,
        index=True,
    )

    experience: Mapped[Experience] = orm_relationship("Experience", back_populates="email_logs")
