"""Media upload/delete API — Cloudinary-backed."""

from __future__ import annotations

import logging
from io import BytesIO
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.common.enums import MediaType
from app.schemas.experience_media import (
    MediaDeleteResponse,
    MediaHealthResponse,
    MediaUploadResponse,
)
from app.services.media_service import media_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=MediaHealthResponse)
def media_health() -> MediaHealthResponse:
    """Cloudinary configuration health check."""
    return MediaHealthResponse(**media_service.health())


@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    db: Annotated[Session, Depends(get_db)],
    file: Annotated[UploadFile, File(..., description="Image file (jpg, jpeg, png, webp)")],
    folder: Annotated[str | None, Form()] = "general",
    filename: Annotated[str | None, Form()] = None,
    experience_uuid: Annotated[UUID | None, Form()] = None,
    media_type: Annotated[MediaType, Form()] = MediaType.PHOTO,
    alt_text: Annotated[str | None, Form()] = None,
) -> MediaUploadResponse:
    """
    Upload a single image to Cloudinary and persist metadata in PostgreSQL.

    Multipart form fields:
    - file (required)
    - folder (optional): birthday | proposal | anniversary | father | mother | ...
    - filename (optional): fallback when multipart Content-Disposition omits a name
    - experience_uuid (optional)
    - media_type (optional, default photo)
    - alt_text (optional)
    """
    # Read via async API, then hand bytes to the sync service (Starlette 1.x safe).
    raw = await file.read()
    resolved_name = (filename or file.filename or "").strip() or None
    media = media_service.upload_image(
        db,
        file=BytesIO(raw),
        filename=resolved_name,
        content_type=file.content_type,
        folder=folder,
        experience_uuid=experience_uuid,
        media_type=media_type,
        alt_text=alt_text,
    )
    return MediaUploadResponse(
        id=str(media.uuid),
        url=media.secure_url or media.file_url,
        public_id=media.cloudinary_public_id or "",
        width=media.width,
        height=media.height,
        format=media.format,
        bytes=media.byte_size,
    )


@router.delete("/{media_id}", response_model=MediaDeleteResponse)
def delete_media(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> MediaDeleteResponse:
    """Delete Cloudinary asset and database media row by UUID (or internal int id)."""
    result = media_service.delete_image(db, media_id)
    return MediaDeleteResponse(**result)


@router.get("")
def list_media() -> dict[str, str]:
    """Placeholder list endpoint (kept for compatibility)."""
    return {"status": "ok", "message": "Use POST /media/upload and DELETE /media/{id}"}
