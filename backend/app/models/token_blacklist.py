"""Revoked token JTIs for logout / refresh invalidation."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.common.utils import utc_now
from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin


class TokenBlacklist(Base, IntegerPrimaryKeyMixin):
    """Stores revoked JWT identifiers until natural expiry."""

    __tablename__ = "token_blacklist"

    jti: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    token_type: Mapped[str] = mapped_column(String(32), nullable=False, default="refresh")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
