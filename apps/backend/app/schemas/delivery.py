"""Delivery status API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class DeliveryStatusResponse(BaseModel):
    status: str = Field(description="email_sent | pending | failed")
    email_sent: bool = False
    pending: bool = False
    failed: bool = False
    recipient_email: str | None = None
    provider: str | None = None
    message_id: str | None = None
    sent_at: datetime | None = None
    error: str | None = None
    retry_count: int = 0
    last_retry: int = 0
    email_type: str = "experience_ready"


class DeliveryRetryResponse(DeliveryStatusResponse):
    retried: bool = True
