"""Public runtime endpoints — no draft data, no internal IDs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.publish import PublicRuntimePayload
from app.services.publish_service import publish_service

router = APIRouter()


@router.get("/{public_token}", response_model=PublicRuntimePayload)
def get_published_experience(
    public_token: str,
    db: Annotated[Session, Depends(get_db)],
) -> PublicRuntimePayload:
    """
    GET /e/{public_uuid|slug}

    Returns Template + frozen ExperienceData + media URLs for the runtime renderer.
    """
    return publish_service.get_public_runtime(db, public_token)
