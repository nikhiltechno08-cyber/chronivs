"""Payment Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.common.enums import PaymentStatus


class PaymentBase(BaseModel):
    provider: str | None = Field(default=None, max_length=64)
    order_id: str | None = Field(default=None, max_length=255)
    payment_id: str | None = Field(default=None, max_length=255)
    signature: str | None = Field(default=None, max_length=512)
    amount: Decimal = Field(ge=0)
    currency: str = Field(default="INR", max_length=8)
    status: PaymentStatus = PaymentStatus.CREATED
    payment_method: str | None = Field(default=None, max_length=64)
    failure_reason: str | None = None


class PaymentCreate(PaymentBase):
    experience_uuid: UUID


class PaymentUpdate(BaseModel):
    provider: str | None = Field(default=None, max_length=64)
    order_id: str | None = Field(default=None, max_length=255)
    payment_id: str | None = Field(default=None, max_length=255)
    signature: str | None = Field(default=None, max_length=512)
    amount: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=8)
    status: PaymentStatus | None = None
    payment_method: str | None = Field(default=None, max_length=64)
    failure_reason: str | None = None


class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    verified_at: datetime | None = None
