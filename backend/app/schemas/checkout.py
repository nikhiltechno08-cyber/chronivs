"""Checkout session Pydantic schemas."""

from __future__ import annotations

import re
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from typing import Any

from app.common.enums import CheckoutStatus
from app.schemas.experience_data import ExperienceData

_INDIAN_MOBILE = re.compile(r"^[6-9]\d{9}$")


class CheckoutCreateRequest(BaseModel):
    """Guest checkout create payload."""

    customer_name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    mobile: str = Field(min_length=10, max_length=15)
    coupon_code: str | None = Field(default=None, max_length=64)
    template_name: str | None = Field(default=None, max_length=128)
    template_slug: str | None = Field(default=None, max_length=128)
    occasion: str | None = Field(default=None, max_length=128)
    relationship: str | None = Field(default=None, max_length=128)
    # Optional canonical experience payload (sectioned ExperienceData).
    # Backward compatible — older clients may omit this field.
    experience_data: ExperienceData | dict[str, Any] | None = None
    # Optional pre-created experience UUID from POST /experiences.
    experience_uuid: UUID | None = None

    @field_validator("customer_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Customer name must be at least 2 characters")
        return cleaned

    @field_validator("mobile")
    @classmethod
    def indian_mobile(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        if not _INDIAN_MOBILE.match(digits):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return digits

    @field_validator("coupon_code")
    @classmethod
    def clean_coupon(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip().upper()
        return cleaned or None


class CheckoutSessionResponse(BaseModel):
    """Checkout session returned to the client."""

    model_config = ConfigDict(from_attributes=True)

    checkout_uuid: UUID
    experience_uuid: UUID
    amount: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    status: CheckoutStatus
    customer_name: str
    email: EmailStr
    mobile: str
    coupon_code: str | None = None
    template_name: str | None = None
    occasion: str | None = None
    relationship: str | None = None
    created_at: datetime
