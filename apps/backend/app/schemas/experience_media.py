"""Experience media Pydantic schemas — Cloudinary-backed references."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.common.enums import MediaType, MediaUploadStatus


class ExperienceMediaBase(BaseModel):
    media_type: MediaType
    display_order: int = 0
    placeholder_url: str | None = Field(default=None, max_length=2048)
    file_url: str | None = Field(default=None, max_length=2048)
    upload_status: MediaUploadStatus = MediaUploadStatus.PLACEHOLDER
    alt_text: str | None = Field(default=None, max_length=255)
    cloudinary_public_id: str | None = Field(default=None, max_length=512)
    secure_url: str | None = Field(default=None, max_length=2048)
    width: int | None = None
    height: int | None = None
    format: str | None = Field(default=None, max_length=32)
    byte_size: int | None = Field(default=None, alias="bytes")
    resource_type: str | None = Field(default=None, max_length=32)


class ExperienceMediaCreate(ExperienceMediaBase):
    experience_uuid: UUID | None = None


class ExperienceMediaUpdate(BaseModel):
    media_type: MediaType | None = None
    display_order: int | None = None
    placeholder_url: str | None = Field(default=None, max_length=2048)
    file_url: str | None = Field(default=None, max_length=2048)
    upload_status: MediaUploadStatus | None = None
    alt_text: str | None = Field(default=None, max_length=255)
    cloudinary_public_id: str | None = Field(default=None, max_length=512)
    secure_url: str | None = Field(default=None, max_length=2048)
    width: int | None = None
    height: int | None = None
    format: str | None = Field(default=None, max_length=32)
    byte_size: int | None = Field(default=None, alias="bytes")
    resource_type: str | None = Field(default=None, max_length=32)


class ExperienceMediaResponse(ExperienceMediaBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    uuid: UUID
    experience_id: int | None = None
    created_at: datetime
    updated_at: datetime


class MediaUploadResponse(BaseModel):
    """Public upload payload for frontend integration."""

    id: str
    url: str
    public_id: str
    width: int | None = None
    height: int | None = None
    format: str | None = None
    bytes: int | None = None


class MediaDeleteResponse(BaseModel):
    id: str
    deleted: bool
    public_id: str | None = None


class MediaHealthResponse(BaseModel):
    status: str
    cloudinary_configured: bool
    folder_root: str
    missing_env: list[str]
    max_image_bytes: int
    allowed_folders: list[str]
