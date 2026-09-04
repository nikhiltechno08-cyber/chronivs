"""Reusable column mixins for ORM models."""

from datetime import datetime

from sqlalchemy import DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.common.utils import utc_now

__all__ = ["utc_now", "TimestampMixin", "IntegerPrimaryKeyMixin"]


class TimestampMixin:
    """UTC created/updated timestamps."""

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


class IntegerPrimaryKeyMixin:
    """Internal integer primary key (never expose publicly)."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
