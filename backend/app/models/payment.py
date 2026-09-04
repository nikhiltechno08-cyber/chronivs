"""Payment ORM model — gateway-agnostic payment records."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.common.enums import PaymentStatus
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, utc_now

if TYPE_CHECKING:
    from app.models.experience import Experience


class Payment(Base, IntegerPrimaryKeyMixin):
    __tablename__ = "payments"

    experience_id: Mapped[int] = mapped_column(
        ForeignKey("experiences.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    provider: Mapped[str | None] = mapped_column(String(64), nullable=True)
    order_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    signature: Mapped[str | None] = mapped_column(String(512), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="INR", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(
            PaymentStatus,
            name="payment_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=PaymentStatus.CREATED,
        nullable=False,
        index=True,
    )
    payment_method: Mapped[str | None] = mapped_column(String(64), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    gateway_response: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    experience: Mapped[Experience] = orm_relationship("Experience", back_populates="payment")
