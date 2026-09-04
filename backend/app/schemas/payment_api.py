"""API schemas for Razorpay create-order / verify / failure endpoints."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.common.enums import ExperienceStatus, PaymentStatus


class CreateOrderRequest(BaseModel):
    experienceId: UUID = Field(description="Experience UUID ready for payment")


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int = Field(description="Amount in minor units (paise for INR)")
    currency: str
    razorpay_key: str
    experience_id: UUID
    payment_status: PaymentStatus
    provider: str = Field(
        description="Active payment provider: mock | razorpay",
    )
    mock_result: str | None = Field(
        default=None,
        description="Mock-only outcome hint: success | failure | cancelled",
    )


class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    experience_id: UUID
    payment_method: str | None = None


class VerifyPaymentResponse(BaseModel):
    success: bool
    payment_status: PaymentStatus
    experience_status: ExperienceStatus
    experience_id: UUID
    order_id: str
    payment_id: str
    amount: Decimal
    currency: str
    verified_at: datetime | None = None
    message: str = "Payment verified"


class PaymentFailureRequest(BaseModel):
    experience_id: UUID
    order_id: str | None = None
    reason: str | None = None
    cancelled: bool = False
    gateway_response: dict[str, Any] | None = None


class PaymentFailureResponse(BaseModel):
    success: bool = False
    payment_status: PaymentStatus
    experience_id: UUID
    message: str
