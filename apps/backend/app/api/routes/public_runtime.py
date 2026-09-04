"""Public runtime API — recipient-facing only."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.public_runtime import (
    PublicAnalyticsEventRequest,
    PublicAnalyticsEventResponse,
    PublicRuntimeResponse,
)
from app.services.analytics_service import analytics_service
from app.services.public_runtime_service import public_runtime_service

router = APIRouter()


@router.get("/{public_uuid}", response_model=PublicRuntimeResponse)
def get_public_experience(
    public_uuid: str,
    db: Annotated[Session, Depends(get_db)],
) -> PublicRuntimeResponse:
    """
    GET /api/v1/public/{uuid}

    Returns template + sanitized ExperienceData + Cloudinary URLs.
    Rejects unpublished / deleted / expired tokens.
    """
    return public_runtime_service.get_runtime(db, public_uuid)


@router.post("/{public_uuid}/events", response_model=PublicAnalyticsEventResponse)
def track_public_event(
    public_uuid: str,
    payload: PublicAnalyticsEventRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PublicAnalyticsEventResponse:
    """Record anonymous runtime analytics for a published experience."""
    return analytics_service.track_public_event(db, public_uuid, payload)
