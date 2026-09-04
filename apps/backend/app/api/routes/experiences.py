"""Experience REST API — CRUD + duplicate/archive + serialization hooks."""

from __future__ import annotations

import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.orm import Session

from app.common.enums import ExperienceStatus
from app.database.session import get_db
from app.schemas.delivery import DeliveryRetryResponse, DeliveryStatusResponse
from app.schemas.experience import (
    ExperienceCreateRequest,
    ExperienceDraftCreateResponse,
    ExperienceListResponse,
    ExperienceResponse,
    ExperienceSectionPatchRequest,
    ExperienceUpdateRequest,
)
from app.schemas.publish import PublishResponse
from app.schemas.publish_validation import (
    PublishValidationRequest,
    PublishValidationResponse,
)
from app.services.email_service import email_service
from app.services.experience_service import experience_service
from app.services.publish_service import publish_service
from app.services.publish_validator import publish_validator

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=ExperienceResponse, status_code=201)
def create_experience(
    payload: ExperienceCreateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    """Create a draft experience (status defaults to draft)."""
    payload.status = payload.status or ExperienceStatus.DRAFT
    return experience_service.create(db, payload)


@router.post("/draft", response_model=ExperienceDraftCreateResponse, status_code=201)
def create_draft_experience(
    payload: ExperienceCreateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceDraftCreateResponse:
    """
    Create Draft Experience — compact response for studio bootstrap.

    Also available via POST /experiences (full ExperienceResponse).
    """
    payload.status = ExperienceStatus.DRAFT
    created = experience_service.create(db, payload)
    return ExperienceDraftCreateResponse(
        id=created.uuid,
        status=created.status,
        createdAt=created.created_at,
        updatedAt=created.updated_at,
        preview_version=created.preview_version,
        experience_data=created.experience_data,
    )


@router.get("", response_model=ExperienceListResponse)
def list_experiences(
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: ExperienceStatus | None = None,
    customer_email: str | None = None,
) -> ExperienceListResponse:
    return experience_service.list(
        db,
        page=page,
        page_size=page_size,
        status=status,
        customer_email=customer_email,
    )


@router.get("/{experience_uuid}", response_model=ExperienceResponse)
def get_experience(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    return experience_service.get(db, experience_uuid)


@router.put("/{experience_uuid}", response_model=ExperienceResponse)
def update_experience(
    experience_uuid: UUID,
    payload: ExperienceUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    return experience_service.update(db, experience_uuid, payload)


@router.patch("/{experience_uuid}/sections", response_model=ExperienceResponse)
def patch_experience_section(
    experience_uuid: UUID,
    payload: ExperienceSectionPatchRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    """Architecture endpoint for future autosave of individual ExperienceData sections."""
    return experience_service.patch_section(
        db,
        experience_uuid,
        payload.section,
        payload.data,
    )


@router.delete("/{experience_uuid}", response_model=ExperienceResponse)
def archive_experience(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    """Soft-delete / archive experience (never hard delete)."""
    return experience_service.archive(db, experience_uuid)


@router.post("/{experience_uuid}/duplicate", response_model=ExperienceResponse, status_code=201)
def duplicate_experience(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> ExperienceResponse:
    return experience_service.duplicate(db, experience_uuid)


@router.get("/{experience_uuid}/export")
def export_experience(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """Serialize Experience → JSON for backup / versioning / future import."""
    return experience_service.serialize(db, experience_uuid)


@router.post(
    "/{experience_uuid}/validate",
    response_model=PublishValidationResponse,
)
def validate_experience_for_publish(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
    payload: PublishValidationRequest | None = Body(default=None),
) -> PublishValidationResponse:
    """
    Pre-publish validation pipeline.

    On success (pre_publish + transition): DRAFT → READY_FOR_PAYMENT.
    Does not publish and does not initiate payment.
    """
    body = payload or PublishValidationRequest()
    return publish_validator.validate_experience(
        db,
        experience_uuid,
        stage=body.stage,
        transition=body.transition,
        extras=body.extras,
    )


@router.post(
    "/{experience_uuid}/publish",
    response_model=PublishResponse,
)
def publish_experience(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> PublishResponse:
    """
    Publish a paid experience (READY_TO_PUBLISH only).

    Atomic: freeze draft → create PublishedExperience → lock as PUBLISHED.
    After success, trigger delivery email (failures do not roll back publish).
    """
    result = publish_service.publish(db, experience_uuid)
    try:
        email_service.deliver_experience_ready(db, experience_uuid)
    except Exception:  # noqa: BLE001 — delivery must not undo publish
        logger.exception(
            "Post-publish email delivery failed experience_uuid=%s",
            experience_uuid,
        )
    return result


@router.get(
    "/{experience_uuid}/delivery-status",
    response_model=DeliveryStatusResponse,
)
def get_delivery_status(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> DeliveryStatusResponse:
    """Return email delivery status for the published experience."""
    return email_service.get_delivery_status(db, experience_uuid)


@router.post(
    "/{experience_uuid}/delivery-retry",
    response_model=DeliveryRetryResponse,
)
def retry_delivery(
    experience_uuid: UUID,
    db: Annotated[Session, Depends(get_db)],
) -> DeliveryRetryResponse:
    """Manually retry the experience-ready email."""
    status = email_service.retry_experience_ready(db, experience_uuid)
    return DeliveryRetryResponse(**status.model_dump(), retried=True)
