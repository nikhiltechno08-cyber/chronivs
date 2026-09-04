"""User ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.database.session import Base
from app.models.mixins import IntegerPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.experience import Experience


class User(Base, IntegerPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    uuid: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    avatar: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    provider: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        default="local",
        doc="Auth provider key: local | google | github | apple | otp | magic_link",
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    experiences: Mapped[list[Experience]] = orm_relationship(
        "Experience",
        back_populates="user",
        cascade="all, delete-orphan",
    )
