"""Checkout session ORM model (guest-friendly, pre-payment)."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Enum, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.common.enums import CheckoutStatus
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, TimestampMixin


class CheckoutSession(Base, IntegerPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "checkout_sessions"

    uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    experience_uuid: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    customer_name: Mapped[str] = mapped_column(String(60), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    mobile: Mapped[str] = mapped_column(String(15), nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    template_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    occasion: Mapped[str | None] = mapped_column(String(128), nullable=True)
    relationship: Mapped[str | None] = mapped_column(String(128), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    status: Mapped[CheckoutStatus] = mapped_column(
        Enum(
            CheckoutStatus,
            name="checkout_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=CheckoutStatus.READY_FOR_PAYMENT,
        nullable=False,
        index=True,
    )
