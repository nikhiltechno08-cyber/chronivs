"""Analytics service — record public runtime events (no PII)."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from app.common.exceptions import NotFoundException, ValidationException
from app.models.experience_analytics import ExperienceAnalyticsEvent
from app.repositories.published_experience_repository import published_experience_repository
from app.schemas.public_runtime import PublicAnalyticsEventRequest, PublicAnalyticsEventResponse

logger = logging.getLogger(__name__)

ALLOWED_EVENTS = frozenset(
    {
        "experience_opened",
        "experience_completed",
        "experience_replay",
        "scene_completed",
        "watch_heartbeat",
    }
)


class AnalyticsService:
    def track_public_event(
        self,
        db: Session,
        public_token: str,
        payload: PublicAnalyticsEventRequest,
    ) -> PublicAnalyticsEventResponse:
        if payload.event not in ALLOWED_EVENTS:
            raise ValidationException(
                "Unknown analytics event.",
                code="invalid_analytics_event",
            )

        published = published_experience_repository.get_by_public_token(db, public_token)
        if published is None or not published.is_active:
            raise NotFoundException(
                "Published experience not found.",
                code="published_not_found",
            )

        # Drop any accidental PII keys from client metadata
        meta: dict[str, Any] = {}
        for key, value in (payload.metadata or {}).items():
            lowered = key.lower()
            if any(part in lowered for part in ("email", "phone", "mobile", "password", "token")):
                continue
            meta[key] = value

        row = ExperienceAnalyticsEvent(
            published_experience_id=published.id,
            public_slug=published.public_slug,
            event=payload.event,
            scene_id=(payload.scene_id or None),
            watch_ms=payload.watch_ms,
            device_type=(payload.device_type or None),
            country=None,
            event_metadata=meta or None,
        )
        db.add(row)
        db.commit()

        logger.info(
            "Analytics event=%s public_slug=%s scene_id=%s",
            payload.event,
            published.public_slug,
            payload.scene_id,
        )
        return PublicAnalyticsEventResponse(ok=True)


analytics_service = AnalyticsService()
