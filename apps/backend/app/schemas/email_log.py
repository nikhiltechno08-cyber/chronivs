"""Email log Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.common.enums import EmailLogStatus


class EmailLogBase(BaseModel):
    recipient: EmailStr
    subject: str = Field(max_length=512)
    status: EmailLogStatus = EmailLogStatus.PENDING
    provider: str | None = Field(default=None, max_length=64)
    email_type: str = Field(default="experience_ready", max_length=64)


class EmailLogCreate(EmailLogBase):
    experience_uuid: UUID


class EmailLogUpdate(BaseModel):
    recipient: EmailStr | None = None
    subject: str | None = Field(default=None, max_length=512)
    status: EmailLogStatus | None = None
    sent_at: datetime | None = None
    provider: str | None = Field(default=None, max_length=64)
    message_id: str | None = Field(default=None, max_length=255)
    error: str | None = None
    retry_count: int | None = Field(default=None, ge=0)


class EmailLogResponse(EmailLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sent_at: datetime | None = None
    message_id: str | None = None
    error: str | None = None
    retry_count: int = 0
